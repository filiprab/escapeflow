import type { AttackVector, TargetComponent, ExploitationTechnique } from '@/types/attack';

/**
 * Creates an AttackVector object from a TargetComponent and ExploitationTechnique
 * Used when executing an attack in the visualization flow
 */
export const createAttackVector = (
  component: TargetComponent,
  technique: ExploitationTechnique
): AttackVector => {
  return {
    id: `${component.id}-${technique.id}`,
    name: `${component.name}: ${technique.name}`,
    description: technique.description,
    detailedDescription: technique.detailedDescription,
    cves: technique.cves,
    pocs: technique.pocs,
    sourcePrivilege: component.sourcePrivilege,
    targetPrivilege: component.targetPrivilege,
    mitigations: technique.mitigations,
    references: technique.references,
    contextSpecificImpact: technique.contextSpecificImpact,
    componentId: component.id,
    techniqueId: technique.id,
  };
};
