import { CVERecord } from '@/types/cve';

interface ClassificationSectionProps {
  cve: CVERecord;
}

export default function ClassificationSection({ cve }: ClassificationSectionProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4">Classification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Operating Systems</h3>
          <div className="flex flex-wrap gap-2">
            {cve.labels?.[0]?.operatingSystems?.map((os) => (
              <span key={os} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                {os}
              </span>
            )) || <span className="text-gray-500 text-sm">None specified</span>}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Components</h3>
          <div className="flex flex-wrap gap-2">
            {cve.labels?.[0]?.components?.map((component) => (
              <span key={component} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                {component}
              </span>
            )) || <span className="text-gray-500 text-sm">None specified</span>}
          </div>
        </div>
      </div>
    </div>
  );
}