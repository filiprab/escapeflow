'use client';

import { targetComponents } from '@/data/attackData';
import type { PrivilegeInfo } from '@/data/attackData';

interface PrivilegePanelProps {
  currentPrivilege: string;
  isOpen: boolean;
  onToggle: () => void;
  attackChainPanelOpen: boolean;
}

// Helper function to get privilege information
const getPrivilegeInfo = (privilegeLevel: string): PrivilegeInfo | null => {
  for (const component of targetComponents) {
    if (component.sourcePrivilegeInfo?.level === privilegeLevel) {
      return component.sourcePrivilegeInfo;
    }
    if (component.targetPrivilegeInfo?.level === privilegeLevel) {
      return component.targetPrivilegeInfo;
    }
  }
  return null;
};

export default function PrivilegePanel({ currentPrivilege, isOpen, onToggle, attackChainPanelOpen }: PrivilegePanelProps) {
  const privInfo = getPrivilegeInfo(currentPrivilege);

  if (!privInfo) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute bottom-0 z-30 transform transition-all duration-300 ${
          attackChainPanelOpen 
            ? 'left-[calc(20rem+(100%-44rem)/2)]' 
            : 'left-[calc((100%-24rem)/2)]'
        } -translate-x-1/2 ${
          isOpen ? '-translate-y-64' : 'translate-y-0'
        } bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-t-lg text-white shadow-lg p-2`}
        title={isOpen ? 'Close Privilege Context' : 'Open Privilege Context'}
      >
        <svg 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} w-4 h-4`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`absolute bottom-0 h-64 bg-gray-800/95 backdrop-blur-lg border-t border-gray-700 transform transition-all duration-300 ease-in-out z-20 ${
          attackChainPanelOpen ? 'left-80 right-96' : 'left-0 right-96'
        } ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex h-full">
          {/* Left Section - Header and Current Level */}
          <div className="flex-shrink-0 w-80 p-4 border-r border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-bold text-white">Privilege Context</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Current attacker capabilities and restrictions
            </p>
            
            {/* Current Privilege Level */}
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                  Current Level
                </span>
              </div>
              <div className="text-white font-semibold">{currentPrivilege}</div>
            </div>
          </div>

          {/* Right Section - Content Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Capabilities */}
              <div>
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">
                  Capabilities
                </h3>
                <ul className="space-y-2">
                  {privInfo.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-green-400 mr-3 mt-1 text-xs">✓</span>
                      <span className="text-gray-300">{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restrictions */}
              <div>
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">
                  Restrictions
                </h3>
                <ul className="space-y-2">
                  {privInfo.restrictions.map((rest, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-red-400 mr-3 mt-1 text-xs">✗</span>
                      <span className="text-gray-300">{rest}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Command Examples */}
              <div>
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">
                  Command Examples
                </h3>
                <div className="bg-gray-900/60 rounded-lg p-3 font-mono text-sm space-y-2">
                  {privInfo.examples.map((example, idx) => (
                    <div key={idx} className="text-gray-300 truncate">
                      <span className="text-blue-400">$</span> {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}