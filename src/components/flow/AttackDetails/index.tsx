'use client';

import type { AttackVector } from '@/types/attack';
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
  if (!attack) {
    return <EmptyState />;
  }

  // AttackVector already contains all the data we need from createAttackVector()
  // including contextSpecificImpact from the technique
  const contextSpecificImpact = attack.contextSpecificImpact || [];

  return (
    <div className="space-y-6">
      <AttackHeader attack={attack} />

      <PrivilegeEscalationSection attack={attack} />

      <ImpactSection
        impacts={contextSpecificImpact}
      />

      <CVESection escalationId={attack.escalationId} />

      <PoCSection pocs={attack.pocs || []} />

      <MitigationsSection mitigations={attack.mitigations || []} />

      <ReferencesSection references={attack.references || []} />
    </div>
  );
}