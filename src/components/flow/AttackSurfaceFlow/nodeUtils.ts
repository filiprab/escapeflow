import { Node, Edge } from 'reactflow';
import { createAttackVector } from '@/lib/utils/attack-utils';
import type { AttackVector, TargetComponent, ExploitationTechnique } from '@/types/attack';

export interface NodeCallbacks {
  onAttackSelect: (attack: AttackVector) => void;
  onPrivilegeEscalation: (newPrivilege: string, attack: AttackVector) => void;
}

// Calculate node position based on index with proper spacing
// Cards are fixed at 340px width, optimized spacing for visual balance
export const calculateNodePosition = (index: number) => {
  const cols = 3; // Number of columns
  const horizontalSpacing = 400; // Horizontal gap between cards (340px card + 60px gap)
  const verticalSpacing = 420; // Vertical gap between rows (more space for readability)
  const startX = 100; // Starting X position
  const startY = 50; // Starting Y position

  return {
    x: startX + (index % cols) * horizontalSpacing,
    y: startY + Math.floor(index / cols) * verticalSpacing,
  };
};

// Generate nodes for the current privilege level
export const generateNodes = (
  components: TargetComponent[],
  callbacks: NodeCallbacks
): Node[] => {
  return components.map((component, index) => ({
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