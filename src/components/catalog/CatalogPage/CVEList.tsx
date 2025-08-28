import { CVEListItem, CVEFilter } from '@/types/cve';
import { FilterOptions } from '@/lib/api/cve';
import CVETable from './CVETable';

interface CVEListProps {
  cves: CVEListItem[];
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId') => void;
  filter: CVEFilter;
  filterOptions: FilterOptions;
  onToggleOS: (os: string) => void;
  onToggleComponent: (component: string) => void;
}

export default function CVEList({ 
  cves, 
  sortBy, 
  sortOrder, 
  onSort,
  filter,
  filterOptions,
  onToggleOS,
  onToggleComponent
}: CVEListProps) {
  return (
    <CVETable 
      cves={cves}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      filter={filter}
      filterOptions={filterOptions}
      onToggleOS={onToggleOS}
      onToggleComponent={onToggleComponent}
    />
  );
}