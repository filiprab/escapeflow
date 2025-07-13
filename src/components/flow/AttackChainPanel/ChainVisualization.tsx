import { useMemo } from 'react';
import type { AttackVector } from '@/data/attackData';

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
      <div className="p-4 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm">No attacks executed yet</p>
          <p className="text-xs mt-2">Select an attack vector to start building your chain</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        {privilegeLevels.map((privilege, index) => (
          <div key={index} className="relative">
            {/* Privilege Node */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white text-center shadow-lg">
              <div className="text-sm font-semibold">{privilege}</div>
            </div>
            
            {/* Attack Arrow & Technique */}
            {index < privilegeLevels.length - 1 && attackChain[index] && (
              <div className="flex flex-col items-center mt-2 mb-2">
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full text-center max-w-full">
                  <div className="truncate" title={attackChain[index].name.split(': ')[1] || attackChain[index].name}>
                    {attackChain[index].name.split(': ')[1] || attackChain[index].name}
                  </div>
                </div>
                <svg className="w-4 h-4 text-red-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L9 13.586V4a1 1 0 112 0v9.586l1.293-1.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}