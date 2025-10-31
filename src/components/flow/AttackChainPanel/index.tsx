'use client';

import type { AttackVector } from '@/types/attack';
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
        } bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-r-lg text-white shadow-lg p-2`}
        title={isOpen ? 'Close Attack Chain' : 'Open Attack Chain'}
      >
        <svg 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} w-4 h-4`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Attack Chain</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg shadow-blue-500/30 border border-blue-400/50">
                  {attackChain.length} {attackChain.length !== 1 ? 'steps' : 'step'}
                </span>
              </div>
            </div>
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