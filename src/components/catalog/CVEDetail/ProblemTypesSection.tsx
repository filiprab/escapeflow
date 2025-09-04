import { CVERecord } from '@/types/cve';

interface ProblemTypesSectionProps {
  cve: CVERecord;
}

export default function ProblemTypesSection({ cve }: ProblemTypesSectionProps) {
  if (!cve.problemTypes || cve.problemTypes.length === 0) {
    return null;
  }

  return (
    <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-red-500/30 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-6">Problem Types</h2>
      <div className="space-y-4">
        {cve.problemTypes.map((problemType, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/20 rounded-xl border border-gray-600/30">
            <span className="text-gray-200 text-lg flex-1">{problemType.description}</span>
            {problemType.cweId && (
              <span className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-sm font-mono font-semibold border border-red-500/30">
                {problemType.cweId}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}