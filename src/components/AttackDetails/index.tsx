'use client';

import type { AttackVector, ExploitationTechnique } from '@/data/attackData';
import { targetComponents } from '@/data/attackData';
import { EmptyState } from './EmptyState';
import { AttackHeader } from './AttackHeader';
import { PrivilegeEscalationSection } from './PrivilegeEscalationSection';
import { ImpactSection } from './ImpactSection';
import { CVESection } from './CVESection';
import { PoCSection } from './PoCSection';
import { MitigationsSection } from './MitigationsSection';
import { ReferencesSection } from './ReferencesSection';

interface AttackDetailsProps {
  attack: AttackVector | null;
}

export default function AttackDetails({ attack }: AttackDetailsProps) {
  // Helper function to get the technique data from attack vector
  const getTechniqueData = (attack: AttackVector): ExploitationTechnique | null => {
    const component = targetComponents.find(comp => comp.id === attack.componentId);
    if (!component) return null;
    
    return component.techniques.find(tech => tech.id === attack.techniqueId) || null;
  };

  if (!attack) {
    return <EmptyState />;
  }

  const techniqueData = getTechniqueData(attack);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-full overflow-y-auto">
      <AttackHeader attack={attack} />
      
      <PrivilegeEscalationSection attack={attack} />
      
      <ImpactSection 
        impacts={techniqueData?.contextSpecificImpact || []} 
      />
      
      <CVESection cves={attack.cves || []} />
      
      <PoCSection pocs={attack.pocs || []} />
      
      <MitigationsSection mitigations={attack.mitigations || []} />
      
      <ReferencesSection references={attack.references || []} />
    </div>
  );
}