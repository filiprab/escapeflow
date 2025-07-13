import Link from 'next/link';
import { CVEListItem } from '@/types/cve';

interface CVECardProps {
  cve: CVEListItem;
}

export default function CVECard({ cve }: CVECardProps) {
  const getSeverityColor = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    if (!metric?.baseScore) return 'bg-gray-600';
    
    const score = metric.baseScore;
    if (score >= 9.0) return 'bg-red-600';
    if (score >= 7.0) return 'bg-orange-600';
    if (score >= 4.0) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getSeverityScore = (cve: CVEListItem) => {
    const metric = cve.metrics?.[0];
    return metric?.baseScore || 'N/A';
  };

  return (
    <Link href={`/catalog/${cve.cveId}`}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-blue-400">{cve.cveId}</h3>
            <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(cve)}`}>
              {getSeverityScore(cve)}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {new Date(cve.datePublished).toLocaleDateString()}
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 leading-relaxed">
          {cve.descriptions[0]?.description || 'No description available'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {cve.labels?.[0]?.operatingSystems?.map((os) => (
            <span key={os} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
              {os}
            </span>
          ))}
          {cve.labels?.[0]?.components?.map((component) => (
            <span key={component} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
              {component}
            </span>
          ))}
        </div>
        
        {cve.references && cve.references.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cve.references.slice(0, 2).map((ref, index) => (
              <span
                key={index}
                className="text-xs text-blue-400"
              >
                Reference {index + 1}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}