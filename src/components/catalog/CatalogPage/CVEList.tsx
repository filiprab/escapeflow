import { CVEListItem } from '@/types/cve';
import CVETable from './CVETable';

interface CVEListProps {
  cves: CVEListItem[];
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity') => void;
}

export default function CVEList({ 
  cves, 
  sortBy, 
  sortOrder, 
  onSort
}: CVEListProps) {
  return (
    <CVETable 
      cves={cves}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
    />
  );
}