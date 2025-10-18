'use client';

import { useState, useEffect } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Dialog, { DialogContent, DialogFooter } from '@/components/ui/Dialog';
import FilterSection from './FilterSection';

export interface FilterConfig {
  key: string;
  title: string;
  options: string[];
}

interface GenericFilterDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  filter: T;
  filterConfigs: FilterConfig[];
  onApplyFilters: (newFilter: T) => void;
  title?: string;
}

export default function GenericFilterDialog<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  filter,
  filterConfigs,
  onApplyFilters,
  title = 'Filter Options'
}: GenericFilterDialogProps<T>) {
  const [currentFilter, setCurrentFilter] = useState<T>(filter);

  useEffect(() => {
    if (isOpen) {
      setCurrentFilter({ ...filter });
    }
  }, [isOpen, filter]);

  const toggleFilterOption = (filterKey: string, option: string) => {
    setCurrentFilter(prev => {
      const currentOptions = Array.isArray(prev[filterKey]) ? prev[filterKey] : [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((item: string) => item !== option)
        : [...currentOptions, option];
      
      return {
        ...prev,
        [filterKey]: newOptions
      } as T;
    });
  };

  const handleApply = () => {
    onApplyFilters(currentFilter);
    onClose();
  };

  const handleReset = () => {
    const resetFilter = Object.keys(filter).reduce((acc, key) => {
      if (Array.isArray(filter[key])) {
        acc[key] = [];
      } else {
        acc[key] = filter[key]; // Keep non-array values as is (like search)
      }
      return acc;
    }, {} as Record<string, unknown>) as T;
    
    setCurrentFilter(resetFilter);
  };

  const getActiveFilterCount = () => {
    return Object.values(currentFilter).reduce(
      (count: number, value) => count + (Array.isArray(value) ? value.length : 0),
      0
    );
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const dialogTitle = (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <FunnelIcon className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold">{title}</span>
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
        {filterConfigs.length === 0 ? (
          <div className="text-center py-12">
            <FunnelIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No filter options available</p>
          </div>
        ) : (
          filterConfigs.map((config) => (
            <FilterSection
              key={config.key}
              title={config.title}
              options={config.options}
              selectedOptions={Array.isArray(currentFilter[config.key]) ? currentFilter[config.key] as string[] : []}
              onToggleOption={(option) => toggleFilterOption(config.key, option)}
            />
          ))
        )}
      </DialogContent>
    </Dialog>
  );
}