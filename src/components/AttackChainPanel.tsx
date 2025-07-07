'use client';

import { useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import type { AttackVector } from '../data/attackData';

interface AttackChainPanelProps {
  attackChain: AttackVector[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function AttackChainPanel({ attackChain, isOpen, onToggle }: AttackChainPanelProps) {
  // Export to PNG
  const downloadImage = useCallback(() => {
    const element = document.getElementById('attack-chain-panel-content');
    if (element) {
      toPng(element, {
        backgroundColor: '#111827',
        width: 320,
        height: element.scrollHeight,
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'attack-chain.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, []);

  // Export to JSON
  const downloadJSON = useCallback(() => {
    const data = {
      attackChain: attackChain.map((attack, index) => ({
        step: index + 1,
        name: attack.name,
        source: attack.sourcePrivilege,
        target: attack.targetPrivilege,
        technique: attack.name.split(': ')[1] || attack.name,
      })),
      metadata: {
        totalSteps: attackChain.length,
        exportDate: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  // Export to PlantUML
  const downloadPlantUML = useCallback(() => {
    const lines = ['@startuml', 'title Attack Chain Visualization', ''];
    
    // Add nodes as activities
    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }
    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    lines.push('start');
    allPrivileges.forEach((privilege, index) => {
      if (index === 0) {
        lines.push(`:${privilege};`);
      } else {
        const attack = attackChain[index - 1];
        const technique = attack ? (attack.name.split(': ')[1] || attack.name) : 'Unknown';
        lines.push(`note right : ${technique}`);
        lines.push(`:${privilege};`);
      }
    });
    lines.push('stop');
    
    lines.push('', '@enduml');
    
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.puml';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  // Export to Mermaid
  const downloadMermaid = useCallback(() => {
    const lines = ['graph TD'];
    
    // Generate node IDs and labels
    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }
    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    // Add nodes
    allPrivileges.forEach((privilege, index) => {
      const nodeId = `node${index}`;
      lines.push(`    ${nodeId}["${privilege}"]`);
    });

    // Add edges with attack techniques as labels
    attackChain.forEach((attack, index) => {
      const sourceId = `node${index}`;
      const targetId = `node${index + 1}`;
      const technique = attack.name.split(': ')[1] || attack.name;
      lines.push(`    ${sourceId} -->|"${technique}"| ${targetId}`);
    });

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.mmd';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  // Generate privilege levels for visualization
  const privilegeLevels = useMemo(() => {
    if (attackChain.length === 0) return [];

    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }
    
    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    return allPrivileges;
  }, [attackChain]);

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
            {attackChain.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm">No attacks executed yet</p>
                  <p className="text-xs mt-2">Select an attack vector to start building your chain</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Privilege Level Chain */}
                <div className="space-y-3">
                  {privilegeLevels.map((privilege, index) => (
                    <div key={index} className="relative">
                      {/* Privilege Node */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white text-center shadow-lg">
                        <div className="text-sm font-semibold">{privilege}</div>
                      </div>
                      
                      {/* Attack Arrow & Technique */}
                      {index < privilegeLevels.length - 1 && attackChain[index] && (
                        <div className="flex flex-col items-center mt-2 mb-2">
                          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full text-center max-w-full">
                            <div className="truncate" title={attackChain[index].name.split(': ')[1] || attackChain[index].name}>
                              {attackChain[index].name.split(': ')[1] || attackChain[index].name}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-red-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L9 13.586V4a1 1 0 112 0v9.586l1.293-1.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Export Footer */}
          {attackChain.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-3 text-center">Export Options</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadImage}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                  title="Export as PNG image"
                >
                  PNG
                </button>
                <button
                  onClick={downloadJSON}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                  title="Export as JSON data"
                >
                  JSON
                </button>
                <button
                  onClick={downloadPlantUML}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                  title="Export as PlantUML diagram"
                >
                  PlantUML
                </button>
                <button
                  onClick={downloadMermaid}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs font-medium transition-colors"
                  title="Export as Mermaid diagram"
                >
                  Mermaid
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}