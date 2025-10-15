import { CVEFilter, CVERecord, CVEListItem } from '@/types/cve';

export interface CVESearchParams extends CVEFilter {
  page?: number;
  limit?: number;
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface CVEApiResponse {
  cves: CVEListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  operatingSystems: string[];
  components: string[];
  severityLevels: string[];
}

export class CVEApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CVEApiError';
  }
}

async function fetchApi(url: string) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new CVEApiError(
      `API request failed: ${response.statusText}`,
      response.status
    );
  }
  
  return response.json();
}

export async function getCVEs(params: CVESearchParams): Promise<CVEApiResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  
  params.operatingSystems?.forEach(os => searchParams.append('os', os));
  params.components?.forEach(component => searchParams.append('component', component));
  params.severityLevels?.forEach(severity => searchParams.append('severity', severity));
  
  const url = `/api/cves?${searchParams.toString()}`;
  return fetchApi(url);
}

export async function getCVEById(cveId: string): Promise<CVERecord> {
  const url = `/api/cves/${encodeURIComponent(cveId)}`;
  return fetchApi(url);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const url = '/api/cves?type=filters';
  return fetchApi(url);
}

export async function deleteCVE(cveId: string): Promise<void> {
  const response = await fetch(`/api/cves/${encodeURIComponent(cveId)}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new CVEApiError(
      `Failed to delete CVE: ${response.statusText}`,
      response.status
    );
  }
}

export interface BulkDeletePayload {
  ids?: string[];
  selectAll?: boolean;
  excludeIds?: string[];
  filter?: CVEFilter;
}

export interface BulkDeleteResponse {
  success: boolean;
  deletedCount: number;
}

export async function bulkDeleteCVEs(payload: BulkDeletePayload): Promise<BulkDeleteResponse> {
  const response = await fetch('/api/cves/bulk-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new CVEApiError(
      errorData.error || 'Failed to delete CVEs',
      response.status
    );
  }

  return response.json();
}
