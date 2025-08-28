import { CVERecord } from '@/types/cve';

interface ProblemTypesSectionProps {
  cve: CVERecord;
}

export default function ProblemTypesSection({ cve }: ProblemTypesSectionProps) {
  if (!cve.problemTypes || cve.problemTypes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Problem Types</h2>
      <div className="space-y-3">
        {cve.problemTypes.map((problemType, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-gray-700">{problemType.description}</span>
            {problemType.cweId && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">
                {problemType.cweId}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}