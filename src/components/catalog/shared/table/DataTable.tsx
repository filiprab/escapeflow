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
      <div className={`overflow-x-auto bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl ${className}`}>
        <div className="p-12 text-center text-gray-300">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div ref={tableRef} className={`group overflow-x-auto bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/50 hover:border-blue-500/30 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 ${className}`}>
      <table className="w-full divide-y divide-gray-700/50" style={{ minWidth: '1200px' }}>
        <TableHeader 
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
        <tbody className="bg-transparent divide-y divide-gray-700/30">
          {data.map((item, index) => (
            <tr 
              key={keyExtractor(item, index)}
              className="hover:bg-gray-700/20 transition-all duration-300"
            >
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}