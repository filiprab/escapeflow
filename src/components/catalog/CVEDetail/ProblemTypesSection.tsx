import { CVERecord } from '@/types/cve';

interface ProblemTypesSectionProps {
  cve: CVERecord;
}

export default function ProblemTypesSection({ cve }: ProblemTypesSectionProps) {
  if (!cve.problemTypes || cve.problemTypes.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4">Problem Types</h2>
      <div className="space-y-3">
        {cve.problemTypes.map((problemType, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-gray-300">{problemType.description}</span>
            {problemType.cweId && (
              <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs font-mono">
                {problemType.cweId}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}