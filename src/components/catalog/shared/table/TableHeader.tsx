import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface ColumnDefinition<T = string> {
  key: T;
  label: string;
  sortable?: boolean;
  className?: string;
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
  className = 'bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10'
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
        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${cellClassName} ${column.className || ''}`}>
          {children}
        </th>
      );
    }

    return (
      <th 
        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-blue-100 transition-colors ${cellClassName} ${column.className || ''}`}
        onClick={() => onSort(column.key)}
      >
        <div className="flex items-center gap-1">
          {children}
          {isCurrentSort && (
            sortOrder === 'asc' 
              ? <ChevronUpIcon className="w-4 h-4 text-blue-200" />
              : <ChevronDownIcon className="w-4 h-4 text-blue-200" />
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
            cellClassName="text-white"
          >
            {column.label}
          </SortableHeaderCell>
        ))}
      </tr>
    </thead>
  );
}