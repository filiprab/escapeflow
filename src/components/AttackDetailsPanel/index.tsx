'use client';

import type { AttackVector } from '@/data/attackData';
import AttackDetails from '../AttackDetails';

interface AttackDetailsPanelProps {
  selectedAttack: AttackVector | null;
}

export default function AttackDetailsPanel({ 
  selectedAttack
}: AttackDetailsPanelProps) {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 z-30"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-bold text-white">Attack Details</h2>
          </div>
          <p className="text-sm text-gray-400">
            {selectedAttack ? 'Selected technique information' : 'Select an attack technique to view details'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AttackDetails attack={selectedAttack} />
        </div>
      </div>
    </div>
  );
}