import { ExternalCVEData } from '@/types/cve';
import { CVEApiError } from './cve';

// Minimal type definitions for API response parsing
type APIDescription = { lang: string; value: string };
type APIReference = { url: string };
type APICVSSMetric = {
  baseScore: number;
  baseSeverity: string;
  vectorString: string;
  version: string;
};

/**
 * Validates CVE ID format (CVE-YYYY-NNNN where YYYY >= 1999 and NNNN >= 0001)
 */
export function validateCVEId(cveId: string): boolean {
  const cveRegex = /^CVE-(\d{4})-(\d{4,})$/;
  const match = cveId.match(cveRegex);
  
  if (!match) {
    return false;
  }
  
  const year = parseInt(match[1], 10);
  const number = parseInt(match[2], 10);
  
  // CVE IDs start from 1999, and number should be at least 1
  return year >= 1999 && number >= 1;
}

/**
 * Generic fetch function with error handling for external APIs
 */
async function fetchExternalApi(url: string, source: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'escapeflow-app/1.0'
      }
    });
    
    if (!response.ok) {
      // Handle common HTTP errors
      if (response.status === 404) {
        throw new CVEApiError(`CVE not found in ${source}`, response.status);
      } else if (response.status === 429) {
        throw new CVEApiError(`Rate limit exceeded for ${source} API`, response.status);
      } else if (response.status >= 500) {
        throw new CVEApiError(`${source} API server error`, response.status);
      } else {
        throw new CVEApiError(
          `${source} API request failed: ${response.statusText}`,
          response.status
        );
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof CVEApiError) {
      throw error;
    }
    
    // Handle network errors or JSON parsing errors
    throw new CVEApiError(
      `Failed to fetch from ${source}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetches CVE data from the National Vulnerability Database (NVD) API
 * @param cveId - The CVE identifier (e.g., "CVE-2023-1234")
 * @returns Promise<ExternalCVEData> - Unified CVE data format
 * @throws CVEApiError - If the API request fails or CVE ID is invalid
 */
export async function fetchFromNVD(cveId: string): Promise<ExternalCVEData> {
  // Validate CVE ID format
  if (!validateCVEId(cveId)) {
    throw new CVEApiError(`Invalid CVE ID format: ${cveId}. Expected format: CVE-YYYY-NNNN`);
  }
  
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cveId)}`;
  
  const rawData = await fetchExternalApi(url, 'NVD');
  const data = rawData as { 
    vulnerabilities?: Array<{ cve: unknown }>; 
    totalResults?: number;
  };
  
  // Validate response structure
  if (!data.vulnerabilities || !Array.isArray(data.vulnerabilities)) {
    throw new CVEApiError('Invalid NVD API response structure');
  }
  
  // Check if CVE was found
  if (data.totalResults === 0 || data.vulnerabilities.length === 0) {
    throw new CVEApiError(`CVE ${cveId} not found in NVD database`, 404);
  }
  
  const cve = data.vulnerabilities[0].cve as {
    id: string;
    published?: string;
    lastModified?: string;
    descriptions?: unknown;
    metrics?: unknown;
    references?: unknown;
    configurations?: unknown;
    weaknesses?: unknown;
  };
  
  // Extract description (prefer English)
  const descriptions = cve.descriptions as APIDescription[] | undefined;
  const description = descriptions?.find(d => d.lang === 'en')?.value || 
                     descriptions?.[0]?.value || 'No description available';
  
  // Extract CVSS metrics (prefer v3.1, then v3.0)
  let cvssScore: number | undefined;
  let cvssSeverity: string | undefined;
  let cvssVector: string | undefined;
  let cvssVersion: string | undefined;
  
  const metrics = cve.metrics as { 
    cvssMetricV31?: Array<{ cvssData: APICVSSMetric }>;
    cvssMetricV30?: Array<{ cvssData: APICVSSMetric }>;
  } | undefined;
  
  if (metrics?.cvssMetricV31?.[0]) {
    const metric = metrics.cvssMetricV31[0].cvssData;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  } else if (metrics?.cvssMetricV30?.[0]) {
    const metric = metrics.cvssMetricV30[0].cvssData;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  }
  
  // Extract references
  const references = (cve.references as APIReference[] | undefined)?.map(ref => ref.url) || [];

  // Extract affected products from configurations
  const affectedProducts: ExternalCVEData['affectedProducts'] = [];
  const configurations = cve.configurations as { nodes?: Array<{ cpeMatch?: Array<{ 
    cpe23Uri: string; 
    vulnerable: boolean;
    versionStartIncluding?: string;
    versionEndExcluding?: string;
    versionEndIncluding?: string;
  }> }> } | undefined;

  if (configurations?.nodes) {
    for (const node of configurations.nodes) {
      if (node.cpeMatch) {
        for (const match of node.cpeMatch) {
          if (match.vulnerable && match.cpe23Uri) {
            // Parse CPE URI: cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*
            const cpeParts = match.cpe23Uri.split(':');
            if (cpeParts.length >= 5) {
              const vendor = cpeParts[3] || 'unknown';
              const product = cpeParts[4] || 'unknown';
              const version = cpeParts[5] || '*';
              
              // Find or create affected product entry
              let affectedProduct = affectedProducts.find(p => p.vendor === vendor && p.product === product);
              if (!affectedProduct) {
                affectedProduct = { vendor, product, versions: [] };
                affectedProducts.push(affectedProduct);
              }
              
              // Add version info
              affectedProduct.versions.push({
                version: match.versionStartIncluding || version,
                status: 'affected',
                lessThan: match.versionEndExcluding,
                versionType: 'semver'
              });
            }
          }
        }
      }
    }
  }

  // Extract problem types/CWEs
  const problemTypes: ExternalCVEData['problemTypes'] = [];
  const weaknesses = cve.weaknesses as Array<{ description: Array<{ lang: string; value: string }> }> | undefined;
  
  if (weaknesses) {
    for (const weakness of weaknesses) {
      if (weakness.description) {
        for (const desc of weakness.description) {
          // Extract CWE ID from description if present (e.g., "CWE-79")
          const cweMatch = desc.value.match(/CWE-(\d+)/);
          problemTypes.push({
            description: desc.value,
            cweId: cweMatch ? `CWE-${cweMatch[1]}` : undefined,
            lang: desc.lang || 'en'
          });
        }
      }
    }
  }
  
  return {
    cveId: cve.id,
    description,
    datePublished: cve.published,
    dateUpdated: cve.lastModified,
    cvssScore,
    cvssSeverity,
    cvssVector,
    cvssVersion,
    references,
    affectedProducts: affectedProducts.length > 0 ? affectedProducts : undefined,
    problemTypes: problemTypes.length > 0 ? problemTypes : undefined,
    source: 'NVD'
  };
}

/**
 * Fetches CVE data from the CVE.org API (MITRE)
 * @param cveId - The CVE identifier (e.g., "CVE-2023-1234")
 * @returns Promise<ExternalCVEData> - Unified CVE data format
 * @throws CVEApiError - If the API request fails or CVE ID is invalid
 */
export async function fetchFromCVEOrg(cveId: string): Promise<ExternalCVEData> {
  // Validate CVE ID format
  if (!validateCVEId(cveId)) {
    throw new CVEApiError(`Invalid CVE ID format: ${cveId}. Expected format: CVE-YYYY-NNNN`);
  }
  
  const url = `https://cveawg.mitre.org/api/cve/${encodeURIComponent(cveId)}`;
  
  const rawData = await fetchExternalApi(url, 'CVE.org');
  const data = rawData as {
    cveMetadata?: { cveId: string; datePublished?: string; dateUpdated?: string };
    containers?: { cna: unknown; adp?: Array<unknown> };
  };
  
  // Validate response structure
  if (!data.cveMetadata || !data.containers) {
    throw new CVEApiError('Invalid CVE.org API response structure');
  }
  
  // Check if the returned CVE ID matches the requested one
  if (data.cveMetadata.cveId !== cveId) {
    throw new CVEApiError(`CVE ID mismatch: requested ${cveId}, got ${data.cveMetadata.cveId}`);
  }
  
  const cna = data.containers.cna as {
    descriptions?: unknown;
    metrics?: unknown;
    references?: unknown;
    affected?: unknown;
    problemTypes?: unknown;
  };
  
  // Extract description (prefer English)
  const descriptions = cna.descriptions as APIDescription[] | undefined;
  const description = descriptions?.find(d => d.lang === 'en')?.value || 
                     descriptions?.[0]?.value || 'No description available';
  
  // Extract CVSS metrics (check CNA first, then ADP if available)
  let cvssScore: number | undefined;
  let cvssSeverity: string | undefined;
  let cvssVector: string | undefined;
  let cvssVersion: string | undefined;
  
  type CVSSMetricContainer = { cvssV3_1?: APICVSSMetric; cvssV3_0?: APICVSSMetric };
  const cnaMetrics = cna.metrics as CVSSMetricContainer[] | undefined;
  const adpMetrics = (data.containers.adp?.[0] as { metrics?: CVSSMetricContainer[] } | undefined)?.metrics;
  
  // Try CNA metrics first (prefer v3.1, then v3.0)
  if (cnaMetrics?.[0]?.cvssV3_1) {
    const metric = cnaMetrics[0].cvssV3_1;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  } else if (cnaMetrics?.[0]?.cvssV3_0) {
    const metric = cnaMetrics[0].cvssV3_0;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  } else if (adpMetrics?.[0]?.cvssV3_1) {
    // Fall back to ADP metrics
    const metric = adpMetrics[0].cvssV3_1;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  } else if (adpMetrics?.[0]?.cvssV3_0) {
    const metric = adpMetrics[0].cvssV3_0;
    cvssScore = metric.baseScore;
    cvssSeverity = metric.baseSeverity;
    cvssVector = metric.vectorString;
    cvssVersion = metric.version;
  }
  
  // Extract references
  const references = (cna.references as APIReference[] | undefined)?.map(ref => ref.url) || [];

  // Extract affected products
  const affectedProducts: ExternalCVEData['affectedProducts'] = [];
  const affected = cna.affected as Array<{
    vendor: string;
    product: string;
    versions: Array<{
      version: string;
      status: string;
      lessThan?: string;
      versionType: string;
    }>;
  }> | undefined;

  if (affected) {
    for (const item of affected) {
      affectedProducts.push({
        vendor: item.vendor,
        product: item.product,
        versions: item.versions
      });
    }
  }

  // Extract problem types/CWEs
  const problemTypes: ExternalCVEData['problemTypes'] = [];
  const problemTypeRaw = cna.problemTypes as Array<{
    descriptions: Array<{
      lang: string;
      description: string;
      cweId?: string;
    }>;
  }> | undefined;

  if (problemTypeRaw) {
    for (const problemType of problemTypeRaw) {
      if (problemType.descriptions) {
        for (const desc of problemType.descriptions) {
          problemTypes.push({
            description: desc.description,
            cweId: desc.cweId,
            lang: desc.lang || 'en'
          });
        }
      }
    }
  }
  
  return {
    cveId: data.cveMetadata.cveId,
    description,
    datePublished: data.cveMetadata.datePublished,
    dateUpdated: data.cveMetadata.dateUpdated,
    cvssScore,
    cvssSeverity,
    cvssVector,
    cvssVersion,
    references,
    affectedProducts: affectedProducts.length > 0 ? affectedProducts : undefined,
    problemTypes: problemTypes.length > 0 ? problemTypes : undefined,
    source: 'CVE.org'
  };
}

/**
 * Fetches CVE data from both NVD and CVE.org APIs concurrently
 * @param cveId - The CVE identifier (e.g., "CVE-2023-1234")
 * @returns Promise containing results from both APIs (may contain errors for individual APIs)
 */
export async function fetchFromBothAPIs(cveId: string): Promise<{
  nvd: { data?: ExternalCVEData; error?: CVEApiError };
  cveOrg: { data?: ExternalCVEData; error?: CVEApiError };
}> {
  const results = await Promise.allSettled([
    fetchFromNVD(cveId),
    fetchFromCVEOrg(cveId)
  ]);
  
  const nvdResult = results[0];
  const cveOrgResult = results[1];
  
  return {
    nvd: nvdResult.status === 'fulfilled' 
      ? { data: nvdResult.value }
      : { error: nvdResult.reason instanceof CVEApiError ? nvdResult.reason : new CVEApiError('Unknown NVD error') },
    cveOrg: cveOrgResult.status === 'fulfilled'
      ? { data: cveOrgResult.value }
      : { error: cveOrgResult.reason instanceof CVEApiError ? cveOrgResult.reason : new CVEApiError('Unknown CVE.org error') }
  };
}