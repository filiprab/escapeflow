import { CVEFilter } from '@/data/cveTypes';
import { CVERecord, CVEListItem } from '@/types/cve';

export interface CVESearchParams extends CVEFilter {
  page?: number;
  limit?: number;
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore';
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