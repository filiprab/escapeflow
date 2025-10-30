import type { AttackVector, TargetComponent, ExploitationTechnique } from '@/types/attack';

/**
 * Creates an AttackVector object from a TargetComponent and ExploitationTechnique
 * Used when executing an attack in the visualization flow
 */
export const createAttackVector = (
  component: TargetComponent,
  technique: ExploitationTechnique
): AttackVector => {
  // Find the matching escalation from the component's escalations
  // Match by componentId and techniqueId - there should be only one match per component+technique pair
  const matchingEscalation = component.escalations?.find(
    (esc) => esc.componentId === component.id && esc.technique.id === technique.id
  );

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
    escalationId: matchingEscalation?.id,
  };
};
