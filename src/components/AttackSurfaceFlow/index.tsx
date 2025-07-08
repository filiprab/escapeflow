'use client';

import { useMemo } from 'react';
import { getAvailableComponents } from '@/data/attackData';
import type { AttackVector } from '@/data/attackData';
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
  const availableComponents = getAvailableComponents(currentPrivilege);

  // Generate nodes based on current privilege level
  const initialNodes = useMemo(() => {
    return generateNodes(currentPrivilege, {
      onAttackSelect,
      onPrivilegeEscalation,
    });
  }, [currentPrivilege, onAttackSelect, onPrivilegeEscalation]);

  // Generate edges
  const initialEdges = useMemo(() => {
    return generateEdges();
  }, []);

  // Check if attack chain is complete
  const isAttackComplete = availableComponents.length === 0 && 
                          (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && 
                          attackChain.length > 0;

  return (
    <div className="w-full h-full relative">
      {isAttackComplete ? (
        <AttackCompletionScreen 
          currentPrivilege={currentPrivilege}
          attackChain={attackChain}
        />
      ) : availableComponents.length === 0 ? (
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