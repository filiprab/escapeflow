'use client';

import { useState, useEffect } from 'react';
import { CVEFilter } from '@/data/cveTypes';
import { getCVEs, getFilterOptions, CVEApiResponse, CVEApiError, FilterOptions } from '@/lib/api/cve';

import CatalogHeader from './CatalogPage/CatalogHeader';
import SearchAndFilters from './CatalogPage/SearchAndFilters';
import CVEList from './CatalogPage/CVEList';
import Pagination from './CatalogPage/Pagination';
import LoadingState from './CatalogPage/LoadingState';
import ErrorState from './CatalogPage/ErrorState';

export default function CatalogPage() {
  const [filter, setFilter] = useState<CVEFilter>({
    operatingSystems: [],
    components: [],
    search: ''
  });
  const [cveData, setCveData] = useState<CVEApiResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ operatingSystems: [], components: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch CVE data and filter options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [cveResponse, filterResponse] = await Promise.all([
          getCVEs({ ...filter, page, limit }),
          getFilterOptions()
        ]);
        
        setCveData(cveResponse);
        setFilterOptions(filterResponse);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof CVEApiError ? err.message : 'Failed to load CVE data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, page]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter.search, filter.operatingSystems, filter.components]);

  const toggleOSFilter = (os: string) => {
    setFilter(prev => ({
      ...prev,
      operatingSystems: prev.operatingSystems.includes(os)
        ? prev.operatingSystems.filter(item => item !== os)
        : [...prev.operatingSystems, os]
    }));
  };

  const toggleComponentFilter = (component: string) => {
    setFilter(prev => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.filter(item => item !== component)
        : [...prev.components, component]
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilter(prev => ({ ...prev, search }));
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!cveData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <CatalogHeader totalCVEs={cveData.total} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SearchAndFilters
            filter={filter}
            filterOptions={filterOptions}
            onSearchChange={handleSearchChange}
            onToggleOS={toggleOSFilter}
            onToggleComponent={toggleComponentFilter}
          />
          
          <div className="lg:col-span-3">
            <Pagination 
              currentPage={page}
              totalPages={cveData.totalPages}
              totalCVEs={cveData.total}
              currentCount={cveData.cves.length}
              onPageChange={setPage}
            />
            
            <CVEList cves={cveData.cves} />
            
            {cveData.cves.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No CVEs found matching the current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}