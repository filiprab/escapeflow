import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { CVEListItem, CVEFilter } from '@/types/cve';
import { FilterOptions } from '@/lib/api/cve';
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CVETableProps {
  cves: CVEListItem[];
  sortBy?: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore') => void;
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onToggleOS: (os: string) => void;
  onToggleComponent: (component: string) => void;
}

export default function CVETable({ 
  cves, 
  sortBy, 
  sortOrder, 
  onSort, 
  filter,
  filterOptions,
  onToggleOS,
  onToggleComponent 
}: CVETableProps) {
  const [showOSDropdown, setShowOSDropdown] = useState(false);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setShowOSDropdown(false);
        setShowComponentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const getSeverityColor = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-600';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    return metric?.baseScore || 'N/A';
  };

  const getSeverityLevel = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'Unknown';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const getOSIcon = (osName: string) => {
    let iconPath = '';
    
    // Windows variants
    if (osName === "Windows") {
      iconPath = '/windows_logo.svg';
    }
    // Android
    else if (osName === "Android") {
      iconPath = '/android_logo.svg';
    }
    // Linux variants  
    else if (osName === "Linux") {
      iconPath = '/linux_logo.svg';
    }
    // macOS variants
    else if (osName === "macOS") {
      iconPath = '/macos_logo.svg';
    }
    // iOS (use Apple logo)
    else if (osName === "iOS") {
      iconPath = '/apple_logo.svg';
    }
    
    return (
      <Image 
        src={iconPath} 
        alt={osName}
        width={24} 
        height={24} 
        className="h-5 w-auto"
      />
    );
  };

  const SortableHeader = ({ 
    column, 
    children, 
    className = '' 
  }: { 
    column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore';
    children: React.ReactNode;
    className?: string;
  }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          sortOrder === 'asc' 
            ? <ChevronUpIcon className="w-4 h-4" />
            : <ChevronDownIcon className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const FilterDropdown = ({ 
    isOpen, 
    onToggle, 
    options, 
    selectedOptions, 
    onToggleOption, 
    title 
  }: {
    isOpen: boolean;
    onToggle: () => void;
    options: string[];
    selectedOptions: string[];
    onToggleOption: (option: string) => void;
    title: string;
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs font-medium text-gray-300 uppercase tracking-wider hover:text-white transition-colors"
      >
        {title}
        <FunnelIcon className="w-4 h-4" />
        {selectedOptions.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
            {selectedOptions.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <label 
                key={option}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => onToggleOption(option)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div ref={tableRef} className="overflow-x-auto bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/70 sticky top-0 z-10">
          <tr>
            <SortableHeader column="cveId">
              CVE ID
            </SortableHeader>
            <SortableHeader column="baseScore">
              Severity
            </SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Level
            </th>
            <SortableHeader column="datePublished">
              Published
            </SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <FilterDropdown
                isOpen={showOSDropdown}
                onToggle={() => {
                  setShowOSDropdown(!showOSDropdown);
                  setShowComponentDropdown(false);
                }}
                options={filterOptions.operatingSystems}
                selectedOptions={filter.operatingSystems}
                onToggleOption={onToggleOS}
                title="Platforms"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <FilterDropdown
                isOpen={showComponentDropdown}
                onToggle={() => {
                  setShowComponentDropdown(!showComponentDropdown);
                  setShowOSDropdown(false);
                }}
                options={filterOptions.components}
                selectedOptions={filter.components}
                onToggleOption={onToggleComponent}
                title="Components"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800/30 divide-y divide-gray-700">
          {cves.map((cve) => (
            <tr 
              key={cve.cveId}
              className="hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <Link 
                  href={`/catalog/${cve.cveId}`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {cve.cveId}
                </Link>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(cve)}`}>
                  {getSeverityScore(cve)}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-gray-300 text-sm">
                  {getSeverityLevel(cve)}
                </span>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-gray-300 text-sm">
                  {new Date(cve.datePublished).toLocaleDateString()}
                </span>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {cve.labels?.operatingSystems?.map((os, index) => (
                    <div key={`${os}-${index}`}>
                      {getOSIcon(os)}
                    </div>
                  ))}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {cve.labels?.components?.slice(0, 2).map((component) => (
                    <span 
                      key={component} 
                      className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                    >
                      {component}
                    </span>
                  ))}
                  {(cve.labels?.components?.length || 0) > 2 && (
                    <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                      +{(cve.labels?.components?.length || 0) - 2}
                    </span>
                  )}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <p 
                    className="text-gray-300 text-sm leading-relaxed"
                    title={cve.descriptions[0]?.description || 'No description available'}
                  >
                    {truncateDescription(
                      cve.descriptions[0]?.description || 'No description available'
                    )}
                  </p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}