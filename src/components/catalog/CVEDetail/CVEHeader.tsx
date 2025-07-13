import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CVERecord, CVEMetric } from '@/types/cve';

interface CVEHeaderProps {
  cve: CVERecord;
}

export default function CVEHeader({ cve }: CVEHeaderProps) {
  const getSeverityColor = (cve: CVERecord) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-600';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVERecord) => {
    const metric = cve.metrics?.[0];
    return metric?.baseScore || 'N/A';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const cvssMetrics: CVEMetric | undefined = cve.metrics?.[0];

  return (
    <div className="mb-8">
      <Link 
        href="/catalog"
        className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-blue-400">{cve.cveId}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Published: {new Date(cve.datePublished).toLocaleDateString()}</span>
            <span>Updated: {new Date(cve.dateUpdated).toLocaleDateString()}</span>
            <span>State: {cve.state}</span>
          </div>
        </div>
        
        {cvssMetrics && (
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${getSeverityColor(cve)}`}>
              {getSeverityScore(cve)} / 10.0
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {getSeverityLabel(cvssMetrics?.baseScore || 0)} Severity
            </div>
          </div>
        )}
      </div>
    </div>
  );
}