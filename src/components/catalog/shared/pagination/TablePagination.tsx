import { FunnelIcon } from '@heroicons/react/24/outline';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentCount: number;
  onPageChange: (page: number) => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  itemName?: string;
  showFilter?: boolean;
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  currentCount,
  onPageChange,
  onFilterClick,
  activeFilterCount = 0,
  itemName = 'items',
  showFilter = true
}: TablePaginationProps) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing {currentCount} of {totalItems.toLocaleString()} {itemName} (Page {currentPage} of {totalPages})
      </div>
      <div className="flex items-center space-x-2">
        {showFilter && onFilterClick && (
          <button
            onClick={onFilterClick}
            className="relative p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors mr-2"
            title={`Filter ${itemName}`}
          >
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 rounded text-sm shadow-sm transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 rounded text-sm shadow-sm transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}