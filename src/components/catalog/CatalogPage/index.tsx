'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { CVEFilter } from '@/types/cve';
import { getCVEs, getFilterOptions, bulkDeleteCVEs, CVEApiResponse, CVEApiError, FilterOptions } from '@/lib/api/cve';

import { CatalogHeader, TablePagination, LoadingState, ErrorState } from '@/components/catalog/shared';
import CVETable from './CVETable';
import FilterDialog from './FilterDialog';
import CVECreationDialog from './CVECreationDialog';
import BulkDeleteConfirmationDialog from './BulkDeleteConfirmationDialog';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => new Set());
  const [selectAllActive, setSelectAllActive] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const limit = 20;

  const resetSelection = useCallback(() => {
    setSelectAllActive(false);
    setSelectedIds(() => new Set());
    setExcludedIds(() => new Set());
  }, []);

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

  useEffect(() => {
    resetSelection();
  }, [debouncedSearchTerm, filter.operatingSystems, filter.components, filter.severityLevels, sortBy, sortOrder, resetSelection]);


  const handleApplyFilters = (newFilter: CVEFilter) => {
    setFilter(newFilter);
  };

  const handleCVECreated = () => {
    // Refresh the CVE data and filter options after successful creation
    fetchCVEData(false);
    
    // Refresh filter options to include any new components/OS
    const refreshFilterOptions = async () => {
      try {
        const filterResponse = await getFilterOptions();
        setFilterOptions(filterResponse);
      } catch (err) {
        console.error('Failed to refresh filter options:', err);
      }
    };
    refreshFilterOptions();
  };

  const totalActiveFilters = filter.operatingSystems.length + filter.components.length + filter.severityLevels.length;

  const handleSearchChange = (search: string) => {
    setFilter(prev => ({ ...prev, search }));
  };

  const isRowSelected = useCallback((cveId: string) => {
    if (selectAllActive) {
      return !excludedIds.has(cveId);
    }
    return selectedIds.has(cveId);
  }, [selectAllActive, excludedIds, selectedIds]);

  const handleRowSelectChange = useCallback((cveId: string, selected: boolean) => {
    if (selectAllActive) {
      setExcludedIds(prev => {
        const next = new Set(prev);
        if (selected) {
          next.delete(cveId);
        } else {
          next.add(cveId);
        }
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (selected) {
          next.add(cveId);
        } else {
          next.delete(cveId);
        }
        return next;
      });
    }
  }, [selectAllActive]);

  const handleSelectAllChange = useCallback((checked: boolean) => {
    if (checked) {
      setSelectAllActive(true);
      setSelectedIds(() => new Set());
      setExcludedIds(() => new Set());
    } else {
      resetSelection();
    }
  }, [resetSelection]);

  const totalAvailable = cveData?.total ?? 0;

  const selectedCount = useMemo(() => {
    if (!cveData) {
      return 0;
    }

    if (selectAllActive) {
      return Math.max(0, cveData.total - excludedIds.size);
    }

    return selectedIds.size;
  }, [cveData, selectAllActive, excludedIds, selectedIds]);

  const hasSelection = selectedCount > 0;
  const isAllSelected = hasSelection && selectedCount === totalAvailable;
  const isSelectionIndeterminate = hasSelection && selectedCount < totalAvailable;

  const selectionSummaryText = useMemo(() => {
    if (!hasSelection) {
      return '';
    }

    if (selectAllActive) {
      if (excludedIds.size === 0) {
        return 'All ' + selectedCount.toLocaleString() + ' CVEs selected';
      }
      return selectedCount.toLocaleString() + ' of ' + totalAvailable.toLocaleString() + ' CVEs selected';
    }

    return selectedCount.toLocaleString() + ' ' + (selectedCount === 1 ? 'CVE' : 'CVEs') + ' selected';
  }, [hasSelection, selectAllActive, excludedIds.size, selectedCount, totalAvailable]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!hasSelection) {
      return;
    }

    setBulkDeleting(true);

    try {
      if (selectAllActive) {
        await bulkDeleteCVEs({
          selectAll: true,
          filter: { ...debouncedFilter },
          excludeIds: Array.from(excludedIds),
        });
      } else {
        await bulkDeleteCVEs({
          ids: Array.from(selectedIds),
        });
      }

      resetSelection();
      setShowBulkDeleteDialog(false);
      await fetchCVEData(false);
    } catch (err) {
      console.error('Failed to delete selected CVEs:', err);
      setError('Failed to delete selected CVEs. Please try again.');
    } finally {
      setBulkDeleting(false);
    }
  }, [hasSelection, selectAllActive, debouncedFilter, excludedIds, selectedIds, resetSelection, fetchCVEData]);

  useEffect(() => {
    if (showBulkDeleteDialog && !hasSelection) {
      setShowBulkDeleteDialog(false);
    }
  }, [showBulkDeleteDialog, hasSelection]);

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

  const handleDelete = async (cveId: string) => {
    try {
      const response = await fetch(`/api/cves/${encodeURIComponent(cveId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete CVE');
      }
      
      // Refresh the CVE data after successful deletion
      setSelectedIds(prev => {
        if (!prev.has(cveId)) {
          return prev;
        }
        const next = new Set(prev);
        next.delete(cveId);
        return next;
      });

      setExcludedIds(prev => {
        if (!prev.has(cveId)) {
          return prev;
        }
        const next = new Set(prev);
        next.delete(cveId);
        return next;
      });

      await fetchCVEData(false);
    } catch (error) {
      console.error('Failed to delete CVE:', error);
      setError('Failed to delete CVE. Please try again.');
    }
  };


  if (initialLoading) {
    return <LoadingState message="Loading CVE catalog..." />;
  }

  if (error && !cveData) {
    return <ErrorState error={error} title="Error Loading CVE Data" backLabel="Back to Catalog" backUrl="/catalog" />;
  }

  if (!cveData) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background grid matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Header Section with Dark Theme */}
      <div className="relative z-10 py-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          <CatalogHeader 
            title="CVE Catalog" 
            description={`Browse and filter ${cveData.total.toLocaleString()} Chromium CVEs`}
          />
        </div>
      </div>
      
      <div className="relative z-10 mx-32 pb-16">
        <div className="w-full">
          {/* Search Bar and Actions */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[220px] max-w-md">
              <input
                type="text"
                placeholder="Search CVE ID or description..."
                value={filter.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-lg transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {hasSelection && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{selectionSummaryText}</span>
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={!hasSelection}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add CVE</span>
              </button>
            </div>
          </div>

          {/* Pagination */}
          <TablePagination 
            currentPage={page}
            totalPages={cveData.totalPages}
            totalItems={cveData.total}
            currentCount={cveData.cves.length}
            onPageChange={setPage}
            onFilterClick={() => setShowFilterDialog(true)}
            activeFilterCount={totalActiveFilters}
            itemName="CVEs"
          />
          
          {/* Table with Loading Overlay */}
          <div className="relative">
            {searchLoading && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-gray-200 font-medium">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            
            <CVETable 
              cves={cveData.cves}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={handleDelete}
              isRowSelected={isRowSelected}
              onRowSelectChange={handleRowSelectChange}
              isAllSelected={isAllSelected}
              isSelectionIndeterminate={isSelectionIndeterminate}
              onSelectAllChange={handleSelectAllChange}
            />
            
            {cveData.cves.length === 0 && !searchLoading && (
              <div className="text-center py-16">
                <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 max-w-md mx-auto">
                  <p className="text-gray-300 text-lg">No CVEs found matching the current filters.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria or filters.</p>
                </div>
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

      <BulkDeleteConfirmationDialog
        isOpen={showBulkDeleteDialog}
        selectedCount={selectedCount}
        totalAvailable={totalAvailable}
        isSelectAll={selectAllActive}
        excludedCount={excludedIds.size}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDeleteConfirm}
        isDeleting={bulkDeleting}
      />

      {/* CVE Creation Dialog */}
      <CVECreationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCVECreated}
      />
    </div>
  );
}
