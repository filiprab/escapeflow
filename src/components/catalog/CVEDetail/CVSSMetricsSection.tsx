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
    <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">CVSS v3.1 Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-sm text-gray-400 font-medium">Attack Vector</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.attackVector || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Attack Complexity</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.attackComplexity || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Privileges Required</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.privilegesRequired || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">User Interaction</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.userInteraction || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Scope</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.scope || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Confidentiality</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.confidentialityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Integrity</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.integrityImpact || 'N/A'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 font-medium">Availability</div>
          <div className="font-semibold text-gray-200 mt-1">{cvssMetrics?.availabilityImpact || 'N/A'}</div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700/30">
        <div className="text-sm text-gray-400 font-medium mb-2">Vector String</div>
        <div className="font-mono text-sm bg-gray-700/30 backdrop-blur-lg px-4 py-3 rounded-xl text-gray-200 border border-gray-600/30">
          {cvssMetrics?.vectorString || 'N/A'}
        </div>
      </div>
    </div>
  );
}