'use client';

import { useMemo } from 'react';
import type { AttackVector } from '@/types/attack';
import { useVisualizationData } from '@/hooks/useVisualizationData';
import { AttackCompletionScreen } from './AttackCompletionScreen';
import { NoTargetsScreen } from './NoTargetsScreen';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { generateNodes, generateEdges } from './nodeUtils';

interface AttackSurfaceFlowProps {
  onAttackSelect: (attack: AttackVector) => void;
  currentPrivilege: string;
  onPrivilegeEscalation: (newPrivilege: string, attack: AttackVector) => void;
  attackChain: AttackVector[];
}

export default function AttackSurfaceFlow({
  onAttackSelect,
  currentPrivilege,
  onPrivilegeEscalation,
  attackChain,
}: AttackSurfaceFlowProps) {
  // Fetch visualization data from database
  const { components, loading, error } = useVisualizationData(currentPrivilege);

  // Generate nodes based on database components
  const initialNodes = useMemo(() => {
    return generateNodes(components, {
      onAttackSelect,
      onPrivilegeEscalation,
    });
  }, [components, onAttackSelect, onPrivilegeEscalation]);

  // Generate edges
  const initialEdges = useMemo(() => {
    return generateEdges();
  }, []);

  // Check if attack chain is complete
  const isAttackComplete = components.length === 0 &&
                          (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') &&
                          attackChain.length > 0;

  return (
    <div className="w-full h-full relative">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading visualization data...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400">Error: {error}</div>
        </div>
      ) : isAttackComplete ? (
        <AttackCompletionScreen
          currentPrivilege={currentPrivilege}
          attackChain={attackChain}
        />
      ) : components.length === 0 ? (
        <NoTargetsScreen currentPrivilege={currentPrivilege} />
      ) : (
        <ReactFlowWrapper
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      )}
    </div>
  );
}