'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { PlatformSelector } from './PlatformSelector';
import { HeaderTitle } from './HeaderTitle';
import { HeaderControls } from './HeaderControls';

export default function Header() {
  const { currentPrivilege, isAttackChainComplete, handleShowTree, handleReset } = useAppContext();
  
  const [selectedOS, setSelectedOS] = useState<string>('android');
  const [selectedBrowser, setSelectedBrowser] = useState<string>('chromium');
  const [showOSDropdown, setShowOSDropdown] = useState<boolean>(false);
  const [showBrowserDropdown, setShowBrowserDropdown] = useState<boolean>(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowOSDropdown(false);
        setShowBrowserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleOSToggle = () => {
    setShowOSDropdown(!showOSDropdown);
    setShowBrowserDropdown(false);
  };

  const handleBrowserToggle = () => {
    setShowBrowserDropdown(!showBrowserDropdown);
    setShowOSDropdown(false);
  };

  const handleOSSelect = (os: string) => {
    setSelectedOS(os);
    setShowOSDropdown(false);
  };

  const handleBrowserSelect = (browser: string) => {
    setSelectedBrowser(browser);
    setShowBrowserDropdown(false);
  };

  return (
    <header className="bg-gray-800 backdrop-blur-lg border-b border-gray-600 p-4 relative z-50">
      <div className="flex items-center justify-between">
        <PlatformSelector
          selectedOS={selectedOS}
          selectedBrowser={selectedBrowser}
          showOSDropdown={showOSDropdown}
          showBrowserDropdown={showBrowserDropdown}
          onOSToggle={handleOSToggle}
          onBrowserToggle={handleBrowserToggle}
          onOSSelect={handleOSSelect}
          onBrowserSelect={handleBrowserSelect}
        />
        
        <HeaderTitle
          selectedBrowser={selectedBrowser}
          selectedOS={selectedOS}
        />
        
        <HeaderControls
          currentPrivilege={currentPrivilege}
          isAttackChainComplete={isAttackChainComplete}
          onShowTree={handleShowTree}
          onReset={handleReset}
        />
      </div>
    </header>
  );
}