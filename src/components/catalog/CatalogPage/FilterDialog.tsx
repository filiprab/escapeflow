'use client';

import { useState, useEffect } from 'react';
import { CVEFilter } from '@/types/cve';
import { FilterOptions } from '@/lib/api/cve';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onApplyFilters: (newFilter: CVEFilter) => void;
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
}

const FilterSection = ({ title, options, selectedOptions, onToggleOption }: FilterSectionProps) => (
  <div className="border-b border-gray-200 pb-6">
    <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <label 
          key={option}
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedOptions.includes(option)}
            onChange={() => onToggleOption(option)}
            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-700 select-none">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

export default function FilterDialog({
  isOpen,
  onClose,
  filter,
  filterOptions,
  onApplyFilters
}: FilterDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tempFilter, setTempFilter] = useState<CVEFilter>(filter);

  // Update temp filter when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTempFilter(filter);
    }
  }, [isOpen, filter]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleTempOS = (os: string) => {
    setTempFilter(prev => ({
      ...prev,
      operatingSystems: prev.operatingSystems.includes(os)
        ? prev.operatingSystems.filter(item => item !== os)
        : [...prev.operatingSystems, os]
    }));
  };

  const toggleTempComponent = (component: string) => {
    setTempFilter(prev => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.filter(item => item !== component)
        : [...prev.components, component]
    }));
  };

  const toggleTempSeverity = (severity: string) => {
    setTempFilter(prev => ({
      ...prev,
      severityLevels: prev.severityLevels.includes(severity)
        ? prev.severityLevels.filter(item => item !== severity)
        : [...prev.severityLevels, severity]
    }));
  };

  const clearAllTempFilters = () => {
    setTempFilter({
      operatingSystems: [],
      components: [],
      severityLevels: [],
      search: tempFilter.search // Keep search term
    });
  };

  const handleApply = () => {
    onApplyFilters(tempFilter);
    onClose();
  };

  const handleCancel = () => {
    setTempFilter(filter); // Reset to original
    onClose();
  };

  const totalTempFilters = tempFilter.operatingSystems.length + tempFilter.components.length + tempFilter.severityLevels.length;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-150 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] transition-all duration-150 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filter CVEs</h2>
              {totalTempFilters > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {totalTempFilters} selected
                </span>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close filter dialog"
              title="Close without applying changes"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            <FilterSection
              title="Severity Levels"
              options={filterOptions.severityLevels}
              selectedOptions={tempFilter.severityLevels}
              onToggleOption={toggleTempSeverity}
            />
            
            <FilterSection
              title="Operating Systems"
              options={filterOptions.operatingSystems}
              selectedOptions={tempFilter.operatingSystems}
              onToggleOption={toggleTempOS}
            />
            
            <FilterSection
              title="Components"
              options={filterOptions.components}
              selectedOptions={tempFilter.components}
              onToggleOption={toggleTempComponent}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={clearAllTempFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                disabled={totalTempFilters === 0}
              >
                Clear Selection
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}