import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

export interface ColumnDefinition<T = string> {
  key: T;
  label?: ReactNode;
  sortable?: boolean;
  className?: string;
  headerRenderer?: () => ReactNode;
}

interface TableHeaderProps<T = string> {
  columns: ColumnDefinition<T>[];
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: T) => void;
  className?: string;
}

export default function TableHeader<T extends string>({ 
  columns, 
  sortBy, 
  sortOrder, 
  onSort,
  className = 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-lg text-gray-200 sticky top-0 z-10'
}: TableHeaderProps<T>) {
  const SortableHeaderCell = ({ 
    column, 
    children, 
    cellClassName = '' 
  }: { 
    column: ColumnDefinition<T>;
    children: React.ReactNode;
    cellClassName?: string;
  }) => {
    const isCurrentSort = sortBy === column.key;
    const isSortable = column.sortable !== false && onSort;

    if (!isSortable) {
      return (
        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${cellClassName} ${column.className || ''}`}>
          {children}
        </th>
      );
    }

    return (
      <th 
        className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-blue-300 transition-all duration-300 hover:scale-[1.02] ${cellClassName} ${column.className || ''}`}
        onClick={() => onSort(column.key)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isCurrentSort && (
            sortOrder === 'asc'
              ? <ChevronUpIcon className="w-4 h-4 text-blue-400" />
              : <ChevronDownIcon className="w-4 h-4 text-blue-400" />
          )}
        </div>
      </th>
    );
  };

  return (
    <thead className={className}>
      <tr>
        {columns.map((column) => (
          <SortableHeaderCell 
            key={column.key} 
            column={column}
            cellClassName="text-gray-200 group-hover:text-gray-100"
          >
            {(column.headerRenderer ? column.headerRenderer() : column.label) ?? null}
          </SortableHeaderCell>
        ))}
      </tr>
    </thead>
  );
}
