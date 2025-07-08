'use client';

import { useState } from 'react';
import type { TargetComponent, ExploitationTechnique } from '@/data/attackData';
import { ComponentHeader } from './ComponentHeader';
import { PrivilegeLevelBadge } from './PrivilegeLevelBadge';
import { TechniqueDropdown } from './TechniqueDropdown';
import { ExecuteAttackButton } from './ExecuteAttackButton';

interface ComponentNodeData {
  component: TargetComponent;
  onSelect: (component: TargetComponent, technique?: ExploitationTechnique) => void;
  onEscalate: (component: TargetComponent, technique: ExploitationTechnique) => void;
  isAvailable: boolean;
}

interface ComponentNodeProps {
  data: ComponentNodeData;
}

export default function AttackVectorNode({ data }: ComponentNodeProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<ExploitationTechnique | null>(null);

  const handleComponentClick = () => {
    data.onSelect(data.component, selectedTechnique || undefined);
  };

  const handleTechniqueSelect = (technique: ExploitationTechnique) => {
    setSelectedTechnique(technique);
    data.onSelect(data.component, technique);
  };

  const handleEscalateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTechnique) {
      data.onEscalate(data.component, selectedTechnique);
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl p-4 min-w-[320px] max-w-[380px] cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20" 
      onClick={handleComponentClick}
    >
      <ComponentHeader 
        name={data.component.name}
        description={data.component.description}
      />
      
      <div className="text-gray-300">
        <PrivilegeLevelBadge 
          sourcePrivilege={data.component.sourcePrivilege}
          targetPrivilege={data.component.targetPrivilege}
        />

        <TechniqueDropdown 
          techniques={data.component.techniques}
          selectedTechnique={selectedTechnique}
          onTechniqueSelect={handleTechniqueSelect}
        />
        
        <ExecuteAttackButton 
          selectedTechnique={selectedTechnique}
          onExecuteClick={handleEscalateClick}
        />
      </div>
    </div>
  );
}