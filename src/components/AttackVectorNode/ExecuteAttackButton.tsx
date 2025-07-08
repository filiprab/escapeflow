import type { ExploitationTechnique } from '@/data/attackData';

interface ExecuteAttackButtonProps {
  selectedTechnique: ExploitationTechnique | null;
  onExecuteClick: (e: React.MouseEvent) => void;
}

export function ExecuteAttackButton({ selectedTechnique, onExecuteClick }: ExecuteAttackButtonProps) {
  return (
    <button 
      onClick={onExecuteClick}
      disabled={!selectedTechnique}
      className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider ${
        selectedTechnique 
          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' 
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
      }`}
    >
      {selectedTechnique ? 'Execute Attack' : 'Select Technique First'}
    </button>
  );
}