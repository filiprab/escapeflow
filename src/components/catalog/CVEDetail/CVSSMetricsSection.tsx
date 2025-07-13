import { CVERecord, CVEMetric } from '@/types/cve';

interface CVSSMetricsSectionProps {
  cve: CVERecord;
}

export default function CVSSMetricsSection({ cve }: CVSSMetricsSectionProps) {
  const cvssMetrics: CVEMetric | undefined = cve.metrics?.[0];

  if (!cvssMetrics) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4">CVSS v3.1 Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-400">Attack Vector</div>
          <div className="font-medium">{cvssMetrics?.attackVector || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Attack Complexity</div>
          <div className="font-medium">{cvssMetrics?.attackComplexity || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Privileges Required</div>
          <div className="font-medium">{cvssMetrics?.privilegesRequired || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">User Interaction</div>
          <div className="font-medium">{cvssMetrics?.userInteraction || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Scope</div>
          <div className="font-medium">{cvssMetrics?.scope || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Confidentiality</div>
          <div className="font-medium">{cvssMetrics?.confidentialityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Integrity</div>
          <div className="font-medium">{cvssMetrics?.integrityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Availability</div>
          <div className="font-medium">{cvssMetrics?.availabilityImpact || 'N/A'}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-sm text-gray-400">Vector String</div>
        <div className="font-mono text-sm bg-gray-700 px-3 py-2 rounded mt-1">
          {cvssMetrics?.vectorString || 'N/A'}
        </div>
      </div>
    </div>
  );
}