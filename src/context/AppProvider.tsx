'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { AppContext, AppContextType } from './AppContext';
import type { AttackVector } from '@/data/attackData';

const STORAGE_KEY = 'escapeflow-app-state';

interface AppProviderProps {
  children: ReactNode;
}

interface PersistedState {
  currentPrivilege: string;
  attackChain: AttackVector[];
  showChainPanel: boolean;
  showTree: boolean;
  showPrivilegePanel: boolean;
}

const loadPersistedState = (): Partial<PersistedState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }
  return {};
};

const savePersistedState = (state: PersistedState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save persisted state:', error);
  }
};

export function AppProvider({ children }: AppProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState<AttackVector | null>(null);
  const [currentPrivilege, setCurrentPrivilege] = useState<string>('V8 Heap Sandbox');
  const [attackChain, setAttackChain] = useState<AttackVector[]>([]);
  const [showChainPanel, setShowChainPanel] = useState<boolean>(true);
  const [showTree, setShowTree] = useState<boolean>(false);
  const [showPrivilegePanel, setShowPrivilegePanel] = useState<boolean>(true);

  // Hydrate from localStorage after component mounts
  useEffect(() => {
    const persistedState = loadPersistedState();
    
    if (persistedState.currentPrivilege !== undefined) {
      setCurrentPrivilege(persistedState.currentPrivilege);
    }
    if (persistedState.attackChain !== undefined) {
      setAttackChain(persistedState.attackChain);
    }
    if (persistedState.showChainPanel !== undefined) {
      setShowChainPanel(persistedState.showChainPanel);
    }
    if (persistedState.showTree !== undefined) {
      setShowTree(persistedState.showTree);
    }
    if (persistedState.showPrivilegePanel !== undefined) {
      setShowPrivilegePanel(persistedState.showPrivilegePanel);
    }
    
    setIsHydrated(true);
  }, []);

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
    setShowChainPanel(true);
    setShowTree(false);
    
    // Clear persisted state
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
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

  // Persist state whenever it changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    const stateToSave: PersistedState = {
      currentPrivilege,
      attackChain,
      showChainPanel,
      showTree,
      showPrivilegePanel,
    };
    savePersistedState(stateToSave);
  }, [isHydrated, currentPrivilege, attackChain, showChainPanel, showTree, showPrivilegePanel]);

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