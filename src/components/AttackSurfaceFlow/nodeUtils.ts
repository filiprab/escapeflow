import { Node, Edge } from 'reactflow';
import { getAvailableComponents, createAttackVector } from '@/data/attackData';
import type { AttackVector, TargetComponent, ExploitationTechnique } from '@/data/attackData';

export interface NodeCallbacks {
  onAttackSelect: (attack: AttackVector) => void;
  onPrivilegeEscalation: (newPrivilege: string, attack: AttackVector) => void;
}

// Calculate node position based on index
export const calculateNodePosition = (index: number) => ({
  x: 200 + (index % 3) * 400,
  y: 100 + Math.floor(index / 3) * 250,
});

// Generate nodes for the current privilege level
export const generateNodes = (
  currentPrivilege: string, 
  callbacks: NodeCallbacks
): Node[] => {
  const availableComponents = getAvailableComponents(currentPrivilege);
  
  return availableComponents.map((component, index) => ({
    id: component.id,
    type: 'attackVector',
    position: calculateNodePosition(index),
    data: {
      component,
      onSelect: (selectedComponent: TargetComponent, technique?: ExploitationTechnique) => {
        if (technique) {
          const attackVector = createAttackVector(selectedComponent, technique);
          callbacks.onAttackSelect(attackVector);
        }
      },
      onEscalate: (selectedComponent: TargetComponent, technique: ExploitationTechnique) => {
        const attackVector = createAttackVector(selectedComponent, technique);
        callbacks.onPrivilegeEscalation(selectedComponent.targetPrivilege, attackVector);
      },
      isAvailable: true,
    },
  }));
};

// Generate initial edges (empty for now)
export const generateEdges = (): Edge[] => {
  return [];
};