import { useMemo } from 'react';
import type { AttackVector } from '@/types/attack';

interface ChainVisualizationProps {
  attackChain: AttackVector[];
}

export function ChainVisualization({ attackChain }: ChainVisualizationProps) {
  const privilegeLevels = useMemo(() => {
    if (attackChain.length === 0) return [];

    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }

    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    return allPrivileges;
  }, [attackChain]);

  if (attackChain.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
            <svg className="w-20 h-20 mx-auto relative z-10 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-300 mb-2">No attacks executed yet</p>
          <p className="text-xs text-gray-500">Select an attack vector to start building your chain</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      {privilegeLevels.map((privilege, index) => (
        <div key={index} className="relative group">
          {/* Privilege Node Card */}
          <div className="relative bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-500/5 to-blue-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative flex items-center gap-3">
              {/* Privilege Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{privilege}</div>
                <div className="text-xs text-blue-300/60">Privilege Level</div>
              </div>

              {/* Status Indicator */}
              <div className={`flex-shrink-0 w-2 h-2 rounded-full ${index === privilegeLevels.length - 1 ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-blue-400 shadow-lg shadow-blue-400/50'}`}>
                {index === privilegeLevels.length - 1 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
                )}
              </div>
            </div>
          </div>

          {/* Connection Line & Attack Technique */}
          {index < privilegeLevels.length - 1 && attackChain[index] && (
            <div className="relative flex flex-col items-center py-3">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/40 via-red-400/60 to-blue-400/40 -translate-x-1/2"></div>

              {/* Attack Badge */}
              <div className="relative z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30 border border-red-400/50 max-w-[calc(100%-2rem)] hover:scale-105 transition-transform duration-200">
                <div className="truncate font-medium" title={attackChain[index].name.split(': ')[1] || attackChain[index].name}>
                  {attackChain[index].name.split(': ')[1] || attackChain[index].name}
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="relative z-10 mt-1">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L9 13.586V4a1 1 0 112 0v9.586l1.293-1.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}