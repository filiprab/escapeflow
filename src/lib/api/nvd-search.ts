/**
 * NVD Search API Utility
 *
 * Provides functions to search NVD's public API for CVE records by keyword.
 * This is used for bulk imports to get CVE IDs matching a keyword,
 * then fetch full details from NVD.
 *
 * Note: NVD API is public and doesn't require authentication for basic usage.
 * With an API key, rate limits increase significantly.
 */

import { CVEApiError } from './cve';
import { ExternalCVEData } from '@/types/cve';

/**
 * Single CVE search result with full CVE data (same as ExternalCVEData)
 */
export type CVESearchResult = ExternalCVEData;

/**
 * Response from NVD search API
 */
export interface CVESearchResponse {
  results: CVESearchResult[];
  total: number;
}

/**
 * NVD API base URL
 */
const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

/**
 * Search NVD database for CVEs using CPE matching with date window.
 *
 * Uses an old Chrome version (9.0.597.5) to match all CVEs that affect
 * that version and newer versions. This is more reliable than keyword search
 * as it uses NVD's version range matching.
 *
 * NVD requires both pubStartDate and pubEndDate with max 120 day range.
 * This function fetches ALL results within the date window (no pagination needed).
 *
 * @param pubStartDate - Start date filter (ISO-8601 format) - REQUIRED
 * @param pubEndDate - End date filter (ISO-8601 format) - REQUIRED
 * @returns Promise<CVESearchResponse>
 * @throws CVEApiError if the request fails
 *
 * @example
 * const results = await searchNVD('2024-01-01T00:00:00.000Z', '2024-04-30T23:59:59.999Z');
 * console.log(`Found ${results.total} CVEs in this window`);
 */
export async function searchNVD(
  pubStartDate: string,
  pubEndDate: string
): Promise<CVESearchResponse> {
  try {
    // Use CPE matching with old Chrome version to get all newer CVEs
    // Version 9.0.597.5 is from 2011, ensuring we catch all modern CVEs
    const cpeName = 'cpe:2.3:a:google:chrome:9.0.597.5:*:*:*:*:*:*:*';

    // Build URL with query parameters
    const params = new URLSearchParams({
      cpeName: cpeName,
      pubStartDate: pubStartDate,
      pubEndDate: pubEndDate,
    });

    const url = `${NVD_API_BASE}?${params.toString()}`;

    // Add API key to headers if available
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const apiKey = process.env.NVD_API_KEY;
    if (apiKey) {
      headers['apiKey'] = apiKey;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new CVEApiError('No CVEs found matching the keyword', response.status);
      } else if (response.status === 429) {
        throw new CVEApiError('Rate limit exceeded for NVD API', response.status);
      } else if (response.status >= 500) {
        throw new CVEApiError('NVD API server error', response.status);
      } else {
        throw new CVEApiError(
          `NVD API request failed: ${response.statusText}`,
          response.status
        );
      }
    }

    const data = await response.json() as {
      vulnerabilities?: Array<{
        cve: {
          id: string;
          published?: string;
          lastModified?: string;
          descriptions?: Array<{ lang: string; value: string }>;
          metrics?: {
            cvssMetricV31?: Array<{ cvssData: { baseScore: number; baseSeverity: string; vectorString: string; version: string } }>;
            cvssMetricV30?: Array<{ cvssData: { baseScore: number; baseSeverity: string; vectorString: string; version: string } }>;
          };
          references?: Array<{ url: string }>;
          configurations?: {
            nodes?: Array<{
              cpeMatch?: Array<{
                cpe23Uri: string;
                vulnerable: boolean;
                versionStartIncluding?: string;
                versionEndExcluding?: string;
                versionEndIncluding?: string;
              }>;
            }>;
          };
          weaknesses?: Array<{ description: Array<{ lang: string; value: string }> }>;
        };
      }>;
      totalResults?: number;
    };

    // Parse response with full CVE data
    const results: CVESearchResult[] = [];
    if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
      console.log("CVEs fetched:");
      console.log(data.vulnerabilities.length);
      for (const vuln of data.vulnerabilities) {
        const cve = vuln.cve;
        if (!cve?.id) continue;

        // Extract description (prefer English)
        const description = cve.descriptions?.find(d => d.lang === 'en')?.value ||
                           cve.descriptions?.[0]?.value || 'No description available';

        // Extract CVSS metrics (prefer v3.1, then v3.0)
        let cvssScore: number | undefined;
        let cvssSeverity: string | undefined;
        let cvssVector: string | undefined;
        let cvssVersion: string | undefined;

        if (cve.metrics?.cvssMetricV31?.[0]) {
          const metric = cve.metrics.cvssMetricV31[0].cvssData;
          cvssScore = metric.baseScore;
          cvssSeverity = metric.baseSeverity;
          cvssVector = metric.vectorString;
          cvssVersion = metric.version;
        } else if (cve.metrics?.cvssMetricV30?.[0]) {
          const metric = cve.metrics.cvssMetricV30[0].cvssData;
          cvssScore = metric.baseScore;
          cvssSeverity = metric.baseSeverity;
          cvssVector = metric.vectorString;
          cvssVersion = metric.version;
        }

        // Extract references
        const references = cve.references?.map(ref => ref.url) || [];

        // Extract affected products from configurations
        const affectedProducts: ExternalCVEData['affectedProducts'] = [];
        if (cve.configurations?.nodes) {
          for (const node of cve.configurations.nodes) {
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
        if (cve.weaknesses) {
          for (const weakness of cve.weaknesses) {
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

        results.push({
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
        });
      }
    }

    return {
      results,
      total: data.totalResults || 0,
    };
  } catch (error) {
    if (error instanceof CVEApiError) {
      throw error;
    }

    // Handle network errors or JSON parsing errors
    throw new CVEApiError(
      `Failed to search NVD: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a CVE's published date is within a date range.
 *
 * @param cveDate - ISO date string from CVE
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 * @returns true if date is within range
 */
export function isWithinDateRange(
  cveDate: string,
  startDate: Date,
  endDate: Date
): boolean {
  if (!cveDate) {
    return false;
  }

  const date = new Date(cveDate);
  return date >= startDate && date <= endDate;
}

/**
 * Extract year from CVE ID (e.g., "CVE-2024-1234" → 2024)
 */
export function extractYearFromCVEId(cveId: string): number | null {
  const match = cveId.match(/CVE-(\d{4})-\d+/);
  return match ? parseInt(match[1], 10) : null;
}
