interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCVEs: number;
  currentCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCVEs,
  currentCount,
  onPageChange
}: PaginationProps) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing {currentCount} of {totalCVEs.toLocaleString()} CVEs (Page {currentPage} of {totalPages})
      </div>
      <div className="flex space-x-2">
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