import { LinkCard } from './LinkCard';

interface CVESectionProps {
  cves: string[];
}

export function CVESection({ cves }: CVESectionProps) {
  if (!cves || cves.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">CVE References ({cves.length})</h3>
      <div className="space-y-2">
        {cves.map((cve, index) => (
          <LinkCard
            key={index}
            href={`https://nvd.nist.gov/vuln/detail/${cve}`}
            title={cve}
            description="NVD CVE Database"
            hoverColor="red"
          />
        ))}
      </div>
    </div>
  );
}