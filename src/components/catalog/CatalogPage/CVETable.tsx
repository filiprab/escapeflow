import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { CVEListItem } from '@/types/cve';
import { DataTable, SeverityBadge, OSIconDisplay, ColumnDefinition } from '@/components/catalog/shared';
import DeleteConfirmationDialog from '@/components/catalog/CVEDetail/DeleteConfirmationDialog';

interface CVETableProps {
  cves: CVEListItem[];
  sortBy?: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity') => void;
  onDelete?: (cveId: string) => Promise<void>;
  isRowSelected: (cveId: string) => boolean;
  onRowSelectChange: (cveId: string, selected: boolean) => void;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onSelectAllChange: (checked: boolean) => void;
}

type SortableColumnKey = 'cveId' | 'datePublished' | 'dateUpdated' | 'baseScore' | 'severity';
type CVEColumnKey =
  | 'select'
  | SortableColumnKey
  | 'platforms'
  | 'components'
  | 'poc'
  | 'description'
  | 'actions';

const sortableColumns: SortableColumnKey[] = ['cveId', 'datePublished', 'dateUpdated', 'baseScore', 'severity'];

export default function CVETable({ 
  cves, 
  sortBy, 
  sortOrder, 
  onSort,
  onDelete,
  isRowSelected,
  onRowSelectChange,
  isAllSelected,
  isSelectionIndeterminate,
  onSelectAllChange,
}: CVETableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCveId, setSelectedCveId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSelectionIndeterminate && !isAllSelected;
    }
  }, [isSelectionIndeterminate, isAllSelected]);
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

  const handleDeleteClick = (cveId: string) => {
    setSelectedCveId(cveId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !selectedCveId) return;
    
    setIsDeleting(true);
    try {
      await onDelete(selectedCveId);
      setShowDeleteDialog(false);
      setSelectedCveId('');
    } catch (error) {
      console.error('Failed to delete CVE:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setShowDeleteDialog(false);
      setSelectedCveId('');
    }
  };

  const columns: ColumnDefinition<CVEColumnKey>[] = [
    {
      key: 'select',
      label: '',
      sortable: false,
      className: 'w-12 text-center',
      headerRenderer: () => (
        <div className="flex items-center justify-center">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-600/70 bg-gray-800 text-blue-500 focus:ring-blue-400"
            checked={isAllSelected}
            onChange={(event) => onSelectAllChange(event.target.checked)}
            aria-label="Select all CVEs"
          />
        </div>
      ),
    },
    { key: 'cveId', label: 'CVE ID' },
    { key: 'baseScore', label: 'CVSS Score' },
    { key: 'severity', label: 'Severity' },
    { key: 'datePublished', label: 'Published' },
    { key: 'platforms', label: 'Platforms', sortable: false },
    { key: 'components', label: 'Targeted Component', sortable: false },
    { key: 'poc', label: 'PoC', sortable: false, className: 'w-20 text-center' },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const renderRow = (cve: CVEListItem) => (
    <>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-600/70 bg-gray-800 text-blue-500 focus:ring-blue-400"
            checked={isRowSelected(cve.cveId)}
            onChange={(event) => onRowSelectChange(cve.cveId, event.target.checked)}
            aria-label={`Select ${cve.cveId}`}
          />
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <Link
          href={`/catalog/${cve.cveId}`}
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline decoration-blue-400/30"
        >
          {cve.cveId}
        </Link>
      </td>
      
      <td className="px-6 py-5 whitespace-nowrap">
        <SeverityBadge score={cve.metrics?.[0]?.baseScore} />
      </td>
      
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-gray-300 text-sm font-medium">
          {getSeverityLevel(cve)}
        </span>
      </td>
      
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-gray-300 text-sm">
          {new Date(cve.datePublished).toLocaleDateString()}
        </span>
      </td>
      
      <td className="px-6 py-5">
        <OSIconDisplay operatingSystems={cve.labels?.operatingSystems || []} />
      </td>
      
      <td className="px-6 py-5">
        {cve.labels?.targetComponent ? (
          <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-sm">
            {cve.labels.targetComponent}
          </span>
        ) : (
          <span className="text-gray-500 text-sm italic">Unlabeled</span>
        )}
      </td>

      <td className="px-6 py-5 whitespace-nowrap text-center">
        {cve.proofOfConcepts && cve.proofOfConcepts.length > 0 ? (
          <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs font-medium">
            PoC
          </span>
        ) : (
          <span className="text-gray-500 text-sm">-</span>
        )}
      </td>

      <td className="px-6 py-5">
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
      
      <td className="px-6 py-5 whitespace-nowrap">
        {onDelete && (
          <button
            onClick={() => handleDeleteClick(cve.cveId)}
            className="group p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 bg-transparent hover:scale-110"
            title="Delete CVE"
          >
            <TrashIcon className="w-4 h-4 group-hover:drop-shadow-lg" />
          </button>
        )}
      </td>
    </>
  );

  const handleSort = (column: CVEColumnKey) => {
    if (!onSort) {
      return;
    }

    if (sortableColumns.includes(column as SortableColumnKey)) {
      onSort(column as SortableColumnKey);
    }
  };

  return (
    <>
      <DataTable<CVEListItem, CVEColumnKey>
        data={cves}
        columns={columns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        renderRow={renderRow}
        keyExtractor={(cve) => cve.cveId}
        emptyMessage="No CVEs found"
      />
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        cveId={selectedCveId}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
