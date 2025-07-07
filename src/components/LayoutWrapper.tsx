'use client';

import { ReactNode } from 'react';
import Header from './Header';

interface LayoutWrapperProps {
  children: ReactNode;
  currentPrivilege: string;
  isAttackChainComplete: boolean;
  onShowTree: () => void;
  onReset: () => void;
}

export default function LayoutWrapper({ 
  children, 
  currentPrivilege, 
  isAttackChainComplete, 
  onShowTree, 
  onReset 
}: LayoutWrapperProps) {
  return (
    <>
      <Header 
        currentPrivilege={currentPrivilege}
        isAttackChainComplete={isAttackChainComplete}
        onShowTree={onShowTree}
        onReset={onReset}
      />
      {children}
    </>
  );
}