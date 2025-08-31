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