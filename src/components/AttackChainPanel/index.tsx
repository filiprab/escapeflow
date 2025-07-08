'use client';

import type { AttackVector } from '@/data/attackData';
import { ChainVisualization } from './ChainVisualization';
import { ExportButtons } from './ExportButtons';

interface AttackChainPanelProps {
  attackChain: AttackVector[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function AttackChainPanel({ attackChain, isOpen, onToggle }: AttackChainPanelProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute top-1/2 left-0 z-20 transform -translate-y-1/2 transition-all duration-300 ${
          isOpen ? 'translate-x-80' : 'translate-x-0'
        } bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-r-lg p-3 text-white shadow-lg`}
        title={isOpen ? 'Close Attack Chain' : 'Open Attack Chain'}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Attack Chain</h2>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {attackChain.length} step{attackChain.length !== 1 ? 's' : ''}
              </span>
            </div>
            {attackChain.length > 0 && (
              <p className="text-gray-400 text-sm">
                Target: {attackChain[attackChain.length - 1]?.targetPrivilege}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" id="attack-chain-panel-content">
            <ChainVisualization attackChain={attackChain} />
          </div>

          {/* Export Footer */}
          <ExportButtons attackChain={attackChain} />
        </div>
      </div>
    </>
  );
}