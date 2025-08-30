'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CVEFilter } from '@/types/cve';
import { getCVEs, getFilterOptions, CVEApiResponse, CVEApiError, FilterOptions } from '@/lib/api/cve';

import CatalogHeader from './CatalogHeader';
import CVEList from './CVEList';
import Pagination from './Pagination';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import FilterDialog from './FilterDialog';

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
    severityLevels: [],
    search: ''
  });
  const [cveData, setCveData] = useState<CVEApiResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ operatingSystems: [], components: [], severityLevels: [] });
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity'>('datePublished');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const limit = 20;

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(filter.search, 300);

  // Create debounced filter object
  const debouncedFilter = useMemo(() => ({
    operatingSystems: filter.operatingSystems,
    components: filter.components,
    severityLevels: filter.severityLevels,
    search: debouncedSearchTerm
  }), [filter.operatingSystems, filter.components, filter.severityLevels, debouncedSearchTerm]);

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
  }, [debouncedSearchTerm, filter.operatingSystems, filter.components, filter.severityLevels, sortBy, sortOrder]);


  const handleApplyFilters = (newFilter: CVEFilter) => {
    setFilter(newFilter);
  };

  const totalActiveFilters = filter.operatingSystems.length + filter.components.length + filter.severityLevels.length;

  const handleSearchChange = (search: string) => {
    setFilter(prev => ({ ...prev, search }));
  };

  const handleSort = (column: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity') => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900">
      {/* Header Section with Blue Background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-6 mb-6">
        <div className="max-w-full mx-auto px-4">
          <CatalogHeader totalCVEs={cveData.total} />
        </div>
      </div>
      
      <div className="max-w-full mx-auto px-6">
        <div className="w-full">
          {/* Search Bar Above Table */}
          <div className="mb-6">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search CVE ID or description..."
                value={filter.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
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
            onFilterClick={() => setShowFilterDialog(true)}
            activeFilterCount={totalActiveFilters}
          />
          
          {/* Table with Loading Overlay */}
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-700">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            
            <CVEList 
              cves={cveData.cves}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            
            {cveData.cves.length === 0 && !searchLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600">No CVEs found matching the current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        filter={filter}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}