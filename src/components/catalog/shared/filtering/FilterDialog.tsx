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

  const dialogTitle = (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <FunnelIcon className="w-6 h-6 text-blue-600" />
      </div>
      <span>{title}</span>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      maxWidth="lg"
      footer={
        <DialogFooter>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters ({getActiveFilterCount()})
          </button>
        </DialogFooter>
      }
    >
      <DialogContent className="space-y-6">
        {filterConfigs.map((config, index) => (
          <FilterSection
            key={config.key}
            title={config.title}
            options={config.options}
            selectedOptions={Array.isArray(currentFilter[config.key]) ? currentFilter[config.key] as string[] : []}
            onToggleOption={(option) => toggleFilterOption(config.key, option)}
            className={index === filterConfigs.length - 1 ? 'border-b-0 pb-0' : ''}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}