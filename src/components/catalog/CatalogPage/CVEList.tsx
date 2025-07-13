import { CVEListItem } from '@/types/cve';
import CVECard from './CVECard';

interface CVEListProps {
  cves: CVEListItem[];
}

export default function CVEList({ cves }: CVEListProps) {
  return (
    <div className="space-y-4">
      {cves.map((cve) => (
        <CVECard key={cve.cveId} cve={cve} />
      ))}
    </div>
  );
}