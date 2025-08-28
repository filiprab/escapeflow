import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CVERecord, CVEMetric } from '@/types/cve';

interface CVEHeaderProps {
  cve: CVERecord;
}

export default function CVEHeader({ cve }: CVEHeaderProps) {
  const getSeverityColor = (cve: CVERecord) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-500 text-white';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600 text-white';
    if (score >= 7.0) return 'bg-orange-500 text-white';
    if (score >= 4.0) return 'bg-yellow-500 text-white';
    return 'bg-green-600 text-white';
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
        className="inline-flex items-center space-x-2 text-blue-100 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">{cve.cveId}</h1>
          <div className="flex items-center space-x-4 text-sm text-blue-100">
            <span>Published: {new Date(cve.datePublished).toLocaleDateString()}</span>
            <span>Updated: {new Date(cve.dateUpdated).toLocaleDateString()}</span>
            <span>State: {cve.state}</span>
          </div>
        </div>
        
        {cvssMetrics && (
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg font-bold ${getSeverityColor(cve)}`}>
              {getSeverityScore(cve)} / 10.0
            </div>
            <div className="text-sm text-blue-100 mt-1">
              {getSeverityLabel(cvssMetrics?.baseScore || 0)} Severity
            </div>
          </div>
        )}
      </div>
    </div>
  );
}