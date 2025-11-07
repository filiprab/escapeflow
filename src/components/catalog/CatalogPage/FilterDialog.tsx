'use client';

import { useState, useEffect } from 'react';
import { CVEFilter } from '@/types/cve';
import { FilterOptions } from '@/lib/api/cve';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { FilterSection } from '@/components/catalog/shared';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onApplyFilters: (newFilter: CVEFilter) => void;
}

export default function FilterDialog({
  isOpen,
  onClose,
  filter,
  filterOptions,
  onApplyFilters
}: FilterDialogProps) {
  const [currentFilter, setCurrentFilter] = useState<CVEFilter>(filter);

  useEffect(() => {
    if (isOpen) {
      setCurrentFilter({ ...filter });
    }
  }, [isOpen, filter]);

  const toggleFilterOption = (filterKey: keyof CVEFilter, option: string) => {
    setCurrentFilter(prev => {
      const currentOptions = Array.isArray(prev[filterKey]) ? prev[filterKey] : [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((item: string) => item !== option)
        : [...currentOptions, option];

      return {
        ...prev,
        [filterKey]: newOptions
      };
    });
  };

  const handlePoCFilterChange = (value: boolean | null) => {
    setCurrentFilter(prev => ({
      ...prev,
      hasPoC: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(currentFilter);
    onClose();
  };

  const handleReset = () => {
    setCurrentFilter({
      operatingSystems: [],
      components: [],
      severityLevels: [],
      search: filter.search, // Keep search as is
      hasPoC: null
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilter.operatingSystems.length > 0) count += currentFilter.operatingSystems.length;
    if (currentFilter.components.length > 0) count += currentFilter.components.length;
    if (currentFilter.severityLevels.length > 0) count += currentFilter.severityLevels.length;
    if (currentFilter.hasPoC !== null && currentFilter.hasPoC !== undefined) count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const dialogTitle = (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <FunnelIcon className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold">Filter CVEs</span>
        {hasActiveFilters && (
          <span className="text-xs text-gray-400 font-normal">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      maxWidth="2xl"
      footer={
        <DialogFooter className="bg-gray-800/50">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Summary */}
            <div className="flex items-center gap-2">
              {hasActiveFilters ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-300 font-medium">
                    {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 px-3 py-2">No filters selected</span>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                disabled={!hasActiveFilters}
                className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-600/40 hover:border-gray-500/40 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset All
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 border border-transparent rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"
              >
                {hasActiveFilters ? `Apply ${activeFilterCount} ${activeFilterCount === 1 ? 'Filter' : 'Filters'}` : 'Close'}
              </button>
            </div>
          </div>
        </DialogFooter>
      }
    >
      <DialogContent className="space-y-1">
        {/* PoC Filter Section */}
        <div className="border-b border-gray-700/50 pb-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 px-4">Proof of Concept Availability</h3>
          <div className="px-4 space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="hasPoC"
                checked={currentFilter.hasPoC === null || currentFilter.hasPoC === undefined}
                onChange={() => handlePoCFilterChange(null)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-400 focus:ring-2"
              />
              <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">All CVEs</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="hasPoC"
                checked={currentFilter.hasPoC === true}
                onChange={() => handlePoCFilterChange(true)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-400 focus:ring-2"
              />
              <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">With PoC</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="hasPoC"
                checked={currentFilter.hasPoC === false}
                onChange={() => handlePoCFilterChange(false)}
                className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-400 focus:ring-2"
              />
              <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">Without PoC</span>
            </label>
          </div>
        </div>

        {/* Existing Filter Sections */}
        <FilterSection
          title="Severity Levels"
          options={filterOptions.severityLevels}
          selectedOptions={currentFilter.severityLevels}
          onToggleOption={(option) => toggleFilterOption('severityLevels', option)}
        />
        <FilterSection
          title="Operating Systems"
          options={filterOptions.operatingSystems}
          selectedOptions={currentFilter.operatingSystems}
          onToggleOption={(option) => toggleFilterOption('operatingSystems', option)}
        />
        <FilterSection
          title="Components"
          options={filterOptions.components}
          selectedOptions={currentFilter.components}
          onToggleOption={(option) => toggleFilterOption('components', option)}
        />
      </DialogContent>
    </Dialog>
  );
}