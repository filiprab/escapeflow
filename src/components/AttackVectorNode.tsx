'use client';

import { useState } from 'react';
import type { TargetComponent, ExploitationTechnique } from '../data/attackData';

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
  const [showTechniques, setShowTechniques] = useState(false);

  const handleComponentClick = () => {
    data.onSelect(data.component, selectedTechnique || undefined);
  };

  const handleTechniqueSelect = (technique: ExploitationTechnique) => {
    setSelectedTechnique(technique);
    setShowTechniques(false);
    data.onSelect(data.component, technique);
  };

  const handleEscalateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTechnique) {
      data.onEscalate(data.component, selectedTechnique);
    }
  };

  const toggleTechniques = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTechniques(!showTechniques);
  };

  return (
    <div 
      className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl p-4 min-w-[320px] max-w-[380px] cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20" 
      onClick={handleComponentClick}
    >
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg leading-tight">{data.component.name}</h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide">Target Component</span>
      </div>
      
      <div className="text-gray-300">
        <p className="text-sm leading-relaxed mb-4 text-gray-400">{data.component.description}</p>
        
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{data.component.sourcePrivilege}</span>
          <span className="text-red-400 font-bold text-xl">→</span>
          <span className="bg-gray-700 px-3 py-2 rounded-lg font-medium">{data.component.targetPrivilege}</span>
        </div>

        {/* Technique Selection */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
            Select Exploitation Technique
          </label>
          <div className="relative">
            <button
              onClick={toggleTechniques}
              className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-left text-sm transition-colors flex justify-between items-center"
            >
              <span className={selectedTechnique ? 'text-white' : 'text-gray-400'}>
                {selectedTechnique ? selectedTechnique.name : 'Choose technique...'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showTechniques ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showTechniques && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {data.component.techniques.map((technique) => (
                  <button
                    key={technique.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTechniqueSelect(technique);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-white">{technique.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{technique.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleEscalateClick}
          disabled={!selectedTechnique}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider ${
            selectedTechnique 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedTechnique ? 'Execute Attack' : 'Select Technique First'}
        </button>
      </div>
    </div>
  );
} 