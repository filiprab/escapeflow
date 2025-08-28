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
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">CVSS v3.1 Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-600">Attack Vector</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.attackVector || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Attack Complexity</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.attackComplexity || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Privileges Required</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.privilegesRequired || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">User Interaction</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.userInteraction || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Scope</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.scope || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Confidentiality</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.confidentialityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Integrity</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.integrityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Availability</div>
          <div className="font-medium text-gray-900">{cvssMetrics?.availabilityImpact || 'N/A'}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">Vector String</div>
        <div className="font-mono text-sm bg-gray-50 px-3 py-2 rounded mt-1 text-gray-800">
          {cvssMetrics?.vectorString || 'N/A'}
        </div>
      </div>
    </div>
  );
}