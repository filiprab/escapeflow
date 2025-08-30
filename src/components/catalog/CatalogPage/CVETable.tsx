import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { CVEListItem } from '@/types/cve';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface CVETableProps {
  cves: CVEListItem[];
  sortBy?: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity') => void;
}

export default function CVETable({ 
  cves, 
  sortBy, 
  sortOrder, 
  onSort
}: CVETableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const getSeverityColor = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-500 text-white';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600 text-white';
    if (score >= 7.0) return 'bg-orange-500 text-white';
    if (score >= 4.0) return 'bg-yellow-500 text-white';
    return 'bg-green-600 text-white';
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
    column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity';
    children: React.ReactNode;
    className?: string;
  }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-blue-100 transition-colors ${className}`}
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortBy === column && (
          sortOrder === 'asc' 
            ? <ChevronUpIcon className="w-4 h-4 text-blue-200" />
            : <ChevronDownIcon className="w-4 h-4 text-blue-200" />
        )}
      </div>
    </th>
  );


  return (
    <div ref={tableRef} className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
          <tr>
            <SortableHeader column="cveId">
              CVE ID
            </SortableHeader>
            <SortableHeader column="baseScore">
              CVSS Score
            </SortableHeader>
            <SortableHeader column="severity">
              Severity
            </SortableHeader>
            <SortableHeader column="datePublished">
              Published
            </SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Platforms
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Targeted Component
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cves.map((cve) => (
            <tr 
              key={cve.cveId}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <Link 
                  href={`/catalog/${cve.cveId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {cve.cveId}
                </Link>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cve)}`}>
                  {getSeverityScore(cve)}
                </div>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-gray-700 text-sm">
                  {getSeverityLevel(cve)}
                </span>
              </td>
              
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-gray-700 text-sm">
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
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {component}
                    </span>
                  ))}
                  {(cve.labels?.components?.length || 0) > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{(cve.labels?.components?.length || 0) - 2}
                    </span>
                  )}
                </div>
              </td>
              
              <td className="px-4 py-4">
                <div className="max-w-md">
                  <p 
                    className="text-gray-700 text-sm leading-relaxed"
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