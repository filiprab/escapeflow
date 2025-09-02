import Link from 'next/link';
import { CVEListItem } from '@/types/cve';
import { DataTable, SeverityBadge, OSIconDisplay, TagList, ColumnDefinition } from '@/components/catalog/shared';

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
  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
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

  const columns: ColumnDefinition<'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity' | 'platforms' | 'components' | 'description'>[] = [
    { key: 'cveId', label: 'CVE ID' },
    { key: 'baseScore', label: 'CVSS Score' },
    { key: 'severity', label: 'Severity' },
    { key: 'datePublished', label: 'Published' },
    { key: 'platforms', label: 'Platforms', sortable: false },
    { key: 'components', label: 'Targeted Component', sortable: false },
    { key: 'description', label: 'Description', sortable: false }
  ];

  const renderRow = (cve: CVEListItem) => (
    <>
      <td className="px-4 py-4 whitespace-nowrap">
        <Link 
          href={`/catalog/${cve.cveId}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {cve.cveId}
        </Link>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <SeverityBadge score={cve.metrics?.[0]?.baseScore} />
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
        <OSIconDisplay operatingSystems={cve.labels?.operatingSystems || []} />
      </td>
      
      <td className="px-4 py-4">
        <TagList tags={cve.labels?.components || []} maxVisible={2} variant="blue" />
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
    </>
  );

  const handleSort = (column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity' | 'platforms' | 'components' | 'description') => {
    // Only sort columns that are actually sortable
    if (onSort && ['cveId', 'datePublished', 'dateUpdated', 'baseScore', 'severity'].includes(column)) {
      onSort(column as 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity');
    }
  };

  return (
    <DataTable<CVEListItem, 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity' | 'platforms' | 'components' | 'description'>
      data={cves}
      columns={columns}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      renderRow={renderRow}
      keyExtractor={(cve) => cve.cveId}
      emptyMessage="No CVEs found"
    />
  );
}