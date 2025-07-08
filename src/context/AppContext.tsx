'use client';

import { createContext, useContext } from 'react';
import type { AttackVector } from '@/data/attackData';

export interface AppContextType {
  // State
  selectedAttack: AttackVector | null;
  currentPrivilege: string;
  attackChain: AttackVector[];
  showChainPanel: boolean;
  showTree: boolean;
  isAttackChainComplete: boolean;
  
  // Actions
  setSelectedAttack: (attack: AttackVector | null) => void;
  setCurrentPrivilege: (privilege: string) => void;
  setAttackChain: (chain: AttackVector[]) => void;
  setShowChainPanel: (show: boolean) => void;
  setShowTree: (show: boolean) => void;
  handleAttackSelect: (attack: AttackVector) => void;
  handlePrivilegeEscalation: (newPrivilege: string, attack: AttackVector) => void;
  handleReset: () => void;
  handleToggleChainPanel: () => void;
  handleShowTree: () => void;
  handleCloseTree: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};