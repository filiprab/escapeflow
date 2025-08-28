'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CVEFilter } from '@/types/cve';
import { getCVEs, getFilterOptions, CVEApiResponse, CVEApiError, FilterOptions } from '@/lib/api/cve';

import CatalogHeader from './CatalogHeader';
import CVEList from './CVEList';
import Pagination from './Pagination';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CatalogPage() {
  const [filter, setFilter] = useState<CVEFilter>({
    operatingSystems: [],
    components: [],
    search: ''
  });
  const [cveData, setCveData] = useState<CVEApiResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ operatingSystems: [], components: [] });
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId'>('datePublished');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const limit = 20;

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(filter.search, 300);

  // Create debounced filter object
  const debouncedFilter = useMemo(() => ({
    operatingSystems: filter.operatingSystems,
    components: filter.components,
    search: debouncedSearchTerm
  }), [filter.operatingSystems, filter.components, debouncedSearchTerm]);

  // Fetch CVE data
  const fetchCVEData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setSearchLoading(true);
      }
      setError(null);
      
      const cveResponse = await getCVEs({ ...debouncedFilter, page, limit, sortBy, sortOrder });
      setCveData(cveResponse);
    } catch (err) {
      console.error('Failed to fetch CVE data:', err);
      setError(err instanceof CVEApiError ? err.message : 'Failed to load CVE data');
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setSearchLoading(false);
      }
    }
  }, [debouncedFilter, page, limit, sortBy, sortOrder]);

  // Fetch filter options (only once on initial load)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const filterResponse = await getFilterOptions();
        setFilterOptions(filterResponse);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch CVE data when filter or page changes
  useEffect(() => {
    fetchCVEData(initialLoading);
  }, [fetchCVEData, initialLoading]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filter.operatingSystems, filter.components, sortBy, sortOrder]);

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

  const handleSort = (column: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId') => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to desc
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (initialLoading) {
    return <LoadingState />;
  }

  if (error && !cveData) {
    return <ErrorState error={error} />;
  }

  if (!cveData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-full mx-auto px-4">
        <CatalogHeader totalCVEs={cveData.total} />
        
        <div className="w-full">
          {/* Search Bar Above Table */}
          <div className="mb-6">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search CVE ID or description..."
                value={filter.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pagination */}
          <Pagination 
            currentPage={page}
            totalPages={cveData.totalPages}
            totalCVEs={cveData.total}
            currentCount={cveData.cves.length}
            onPageChange={setPage}
          />
          
          {/* Table with Loading Overlay */}
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-300">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            
            <CVEList 
              cves={cveData.cves}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              filter={filter}
              filterOptions={filterOptions}
              onToggleOS={toggleOSFilter}
              onToggleComponent={toggleComponentFilter}
            />
            
            {cveData.cves.length === 0 && !searchLoading && (
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