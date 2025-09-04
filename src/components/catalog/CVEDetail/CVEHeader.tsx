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
    <div className="mb-12">
      <div className="flex items-start justify-between mb-8">
        <Link 
          href="/catalog"
          className="group inline-flex items-center gap-3 px-4 py-2 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:border-blue-500/50 rounded-xl text-gray-300 hover:text-blue-300 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/10"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Catalog</span>
        </Link>
        
        {cvssMetrics && (
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:border-purple-500/30 transition-all duration-300">
            <div className={`inline-block px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${getSeverityColor(cve)}`}>
              {getSeverityScore(cve)} / 10.0
            </div>
            <div className="text-sm text-gray-300 mt-3 font-medium text-center">
              {getSeverityLabel(cvssMetrics?.baseScore || 0)} Severity
            </div>
          </div>
        )}
      </div>
      
      <div>
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent text-left">{cve.cveId}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <span>Published: {new Date(cve.datePublished).toLocaleDateString()}</span>
            <span>Updated: {new Date(cve.dateUpdated).toLocaleDateString()}</span>
            <span>State: {cve.state}</span>
          </div>
        </div>
      </div>
    </div>
  );
}