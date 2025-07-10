'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { AppContext, AppContextType } from './AppContext';
import type { AttackVector } from '@/data/attackData';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [selectedAttack, setSelectedAttack] = useState<AttackVector | null>(null);
  const [currentPrivilege, setCurrentPrivilege] = useState<string>('V8 Heap Sandbox');
  const [attackChain, setAttackChain] = useState<AttackVector[]>([]);
  const [showChainPanel, setShowChainPanel] = useState<boolean>(true);
  const [showTree, setShowTree] = useState<boolean>(false);
  const [showPrivilegePanel, setShowPrivilegePanel] = useState<boolean>(true);

  const handleAttackSelect = useCallback((attack: AttackVector) => {
    setSelectedAttack(attack);
  }, []);

  const handlePrivilegeEscalation = useCallback((newPrivilege: string, attack: AttackVector) => {
    setCurrentPrivilege(newPrivilege);
    setAttackChain(prev => [...prev, attack]);
    setSelectedAttack(null);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentPrivilege('V8 Heap Sandbox');
    setSelectedAttack(null);
    setAttackChain([]);
    setShowChainPanel(false);
    setShowTree(false);
  }, []);

  const handleToggleChainPanel = useCallback(() => {
    setShowChainPanel(prev => !prev);
  }, []);

  const handleTogglePrivilegePanel = useCallback(() => {
    setShowPrivilegePanel(prev => !prev);
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

  const contextValue: AppContextType = {
    // State
    selectedAttack,
    currentPrivilege,
    attackChain,
    showChainPanel,
    showTree,
    showPrivilegePanel,
    isAttackChainComplete,
    
    // Actions
    setSelectedAttack,
    setCurrentPrivilege,
    setAttackChain,
    setShowChainPanel,
    setShowTree,
    setShowPrivilegePanel,
    handleAttackSelect,
    handlePrivilegeEscalation,
    handleReset,
    handleToggleChainPanel,
    handleTogglePrivilegePanel,
    handleShowTree,
    handleCloseTree,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}