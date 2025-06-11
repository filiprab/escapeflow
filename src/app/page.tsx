'use client';

import { useState, useCallback } from 'react';
import AttackSurfaceFlow from '../components/AttackSurfaceFlow';
import AttackDetails from '../components/AttackDetails';
import AttackChainVisualization from '../components/AttackChainVisualization';
import type { AttackVector } from '../data/attackData';

export default function Home() {
  const [selectedAttack, setSelectedAttack] = useState<AttackVector | null>(null);
  const [currentPrivilege, setCurrentPrivilege] = useState<string>('initial');
  const [attackChain, setAttackChain] = useState<AttackVector[]>([]);
  const [showChainVisualization, setShowChainVisualization] = useState<boolean>(false);

  const handleAttackSelect = useCallback((attack: AttackVector) => {
    setSelectedAttack(attack);
  }, []);

  const handlePrivilegeEscalation = useCallback((newPrivilege: string, attack: AttackVector) => {
    setCurrentPrivilege(newPrivilege);
    setAttackChain(prev => [...prev, attack]);
    setSelectedAttack(null);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentPrivilege('initial');
    setSelectedAttack(null);
    setAttackChain([]);
    setShowChainVisualization(false);
  }, []);

  const handleShowChain = useCallback(() => {
    setShowChainVisualization(true);
  }, []);

  const handleCloseChain = useCallback(() => {
    setShowChainVisualization(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-gray-700 p-4 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
          Chromium Android Sandbox Escape - Attack Surface Visualization
        </h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-gray-300">
            Current Privilege Level:{' '}
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold text-white">
              {currentPrivilege}
            </span>
          </p>
          <div className="flex gap-2">
            {attackChain.length > 0 && (
              <button
                onClick={handleShowChain}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm"
              >
                View Chain ({attackChain.length})
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm"
            >
              Reset Simulation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Flow Container */}
        <div className="flex-1 bg-gray-900/50 border-r border-gray-700">
          <AttackSurfaceFlow
            onAttackSelect={handleAttackSelect}
            currentPrivilege={currentPrivilege}
            onPrivilegeEscalation={handlePrivilegeEscalation}
          />
        </div>

        {/* Details Panel */}
        {selectedAttack && (
          <div className="w-96 bg-gray-800/95 backdrop-blur-lg border-l border-gray-700 overflow-y-auto">
            <AttackDetails attack={selectedAttack} />
          </div>
        )}
      </div>

      {/* Attack Chain Visualization Modal */}
      {showChainVisualization && (
        <AttackChainVisualization
          attackChain={attackChain}
          onClose={handleCloseChain}
        />
      )}
    </div>
  );
}
