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
    <div className="mb-6 flex justify-between items-center">
      <div className="text-sm text-gray-300">
        Showing {currentCount} of {totalItems.toLocaleString()} {itemName} (Page {currentPage} of {totalPages})
      </div>
      <div className="flex items-center gap-3">
        {showFilter && onFilterClick && (
          <button
            onClick={onFilterClick}
            className="group relative p-3 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/10"
            title={`Filter ${itemName}`}
          >
            <FunnelIcon className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium hover:scale-[1.02] disabled:hover:scale-100"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium hover:scale-[1.02] disabled:hover:scale-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}