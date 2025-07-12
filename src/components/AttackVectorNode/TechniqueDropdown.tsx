import { useState } from 'react';
import type { ExploitationTechnique } from '@/data/attackData';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface TechniqueDropdownProps {
  techniques: ExploitationTechnique[];
  selectedTechnique: ExploitationTechnique | null;
  onTechniqueSelect: (technique: ExploitationTechnique) => void;
}

export function TechniqueDropdown({ techniques, selectedTechnique, onTechniqueSelect }: TechniqueDropdownProps) {
  const [showTechniques, setShowTechniques] = useState(false);

  const handleToggleTechniques = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTechniques(!showTechniques);
  };

  const handleTechniqueSelect = (technique: ExploitationTechnique, e: React.MouseEvent) => {
    e.stopPropagation();
    onTechniqueSelect(technique);
    setShowTechniques(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
        Select Exploitation Technique
      </label>
      <div className="relative">
        <button
          onClick={handleToggleTechniques}
          className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-left text-sm transition-colors flex justify-between items-center"
        >
          <span className={selectedTechnique ? 'text-white' : 'text-gray-400'}>
            {selectedTechnique ? selectedTechnique.name : 'Choose technique...'}
          </span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTechniques ? 'rotate-180' : ''}`} />
        </button>
        
        {showTechniques && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {techniques.map((technique) => (
              <button
                key={technique.id}
                onClick={(e) => handleTechniqueSelect(technique, e)}
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
  );
}