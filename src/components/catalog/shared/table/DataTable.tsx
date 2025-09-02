import { useRef } from 'react';
import TableHeader, { ColumnDefinition } from './TableHeader';

interface DataTableProps<T, K extends string = string> {
  data: T[];
  columns: ColumnDefinition<K>[];
  sortBy?: K;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: K) => void;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
}

export default function DataTable<T, K extends string = string>({ 
  data, 
  columns, 
  sortBy, 
  sortOrder, 
  onSort, 
  renderRow,
  keyExtractor,
  className = '',
  emptyMessage = 'No data available'
}: DataTableProps<T, K>) {
  const tableRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className={`overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div ref={tableRef} className={`overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <TableHeader 
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr 
              key={keyExtractor(item, index)}
              className="hover:bg-gray-50 transition-colors"
            >
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}