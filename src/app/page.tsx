'use client';

import { useState, useCallback, useEffect } from 'react';
import AttackSurfaceFlow from '../components/AttackSurfaceFlow';
import AttackDetails from '../components/AttackDetails';
import AttackChainPanel from '../components/AttackChainPanel';
import TreeView from '../components/TreeView';
import LayoutWrapper from '../components/LayoutWrapper';
import type { AttackVector } from '../data/attackData';

export default function Home() {
  const [selectedAttack, setSelectedAttack] = useState<AttackVector | null>(null);
  const [currentPrivilege, setCurrentPrivilege] = useState<string>('initial');
  const [attackChain, setAttackChain] = useState<AttackVector[]>([]);
  const [showChainPanel, setShowChainPanel] = useState<boolean>(true);
  const [showTree, setShowTree] = useState<boolean>(false);

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
    setShowChainPanel(false);
    setShowTree(false);
  }, []);

  const handleToggleChainPanel = useCallback(() => {
    setShowChainPanel(prev => !prev);
  }, []);

  const handleShowTree = useCallback(() => {
    setShowTree(true);
  }, []);

  const handleCloseTree = useCallback(() => {
    setShowTree(false);
  }, []);

  // Listen for custom events from the completion screen
  useEffect(() => {
    const handleShowChainEvent = () => {
      setShowChainPanel(true);
    };

    const handleResetEvent = () => {
      handleReset();
    };

    window.addEventListener('showChain', handleShowChainEvent);
    window.addEventListener('resetSimulation', handleResetEvent);

    return () => {
      window.removeEventListener('showChain', handleShowChainEvent);
      window.removeEventListener('resetSimulation', handleResetEvent);
    };
  }, [handleReset]);

  // Check if attack chain is complete
  const isAttackChainComplete = (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && attackChain.length > 0;

  return (
    <LayoutWrapper
      currentPrivilege={currentPrivilege}
      isAttackChainComplete={isAttackChainComplete}
      onShowTree={handleShowTree}
      onReset={handleReset}
    >
      <div className="relative h-[calc(100vh-88px)]">
        {/* Attack Chain Panel */}
        <AttackChainPanel
          attackChain={attackChain}
          isOpen={showChainPanel}
          onToggle={handleToggleChainPanel}
        />

        {/* Main Content */}
        <div 
          className={`flex h-full transition-all duration-300 ${
            showChainPanel ? 'ml-80' : 'ml-0'
          }`}
        >
        {/* Flow Container */}
        <div className="flex-1 bg-gray-900/50 border-r border-gray-700">
          <AttackSurfaceFlow
            onAttackSelect={handleAttackSelect}
            currentPrivilege={currentPrivilege}
            onPrivilegeEscalation={handlePrivilegeEscalation}
            attackChain={attackChain}
          />
        </div>

          {/* Details Panel */}
          {selectedAttack && (
            <div className="w-96 bg-gray-800/95 backdrop-blur-lg border-l border-gray-700 overflow-y-auto">
              <AttackDetails attack={selectedAttack} />
            </div>
          )}
        </div>

        {/* Comprehensive Tree View Modal */}
        {showTree && (
          <TreeView
            onAttackSelect={handleAttackSelect}
            onClose={handleCloseTree}
          />
        )}
      </div>
    </LayoutWrapper>
  );
}
