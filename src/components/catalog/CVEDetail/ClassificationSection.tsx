import { CVERecord } from '@/types/cve';

interface ClassificationSectionProps {
  cve: CVERecord;
}

export default function ClassificationSection({ cve }: ClassificationSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Classification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Operating Systems</h3>
          <div className="flex flex-wrap gap-2">
            {cve.labels?.operatingSystems?.map((os) => (
              <span key={os} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {os}
              </span>
            )) || <span className="text-gray-500 text-sm">None specified</span>}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Components</h3>
          <div className="flex flex-wrap gap-2">
            {cve.labels?.components?.map((component) => (
              <span key={component} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {component}
              </span>
            )) || <span className="text-gray-500 text-sm">None specified</span>}
          </div>
        </div>
      </div>
    </div>
  );
}