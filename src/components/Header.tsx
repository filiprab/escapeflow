'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeaderProps {
  currentPrivilege: string;
  isAttackChainComplete: boolean;
  onShowTree: () => void;
  onReset: () => void;
}

export default function Header({ currentPrivilege, isAttackChainComplete, onShowTree, onReset }: HeaderProps) {
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

  return (
    <header className="bg-gray-800 backdrop-blur-lg border-b border-gray-600 p-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Platform Selection */}
        <div className="flex items-center gap-4">
          {/* Operating System Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowOSDropdown(!showOSDropdown);
                setShowBrowserDropdown(false);
              }}
              className="flex items-center justify-between px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-all duration-200 shadow-md hover:shadow-lg w-56"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {selectedOS === 'android' && (
                    <Image src="/android_logo.svg" alt="Android" width={20} height={20} className="object-contain" />
                  )}
                  {selectedOS === 'ios' && (
                    <Image src="/apple_logo.svg" alt="iOS" width={20} height={20} className="object-contain" />
                  )}
                  {selectedOS === 'macos' && (
                    <Image src="/macos_logo.svg" alt="macOS" width={20} height={20} className="object-contain" />
                  )}
                  {selectedOS === 'linux' && (
                    <Image src="/linux_logo.svg" alt="Linux" width={20} height={20} className="object-contain" />
                  )}
                  {selectedOS === 'windows' && (
                    <Image src="/windows_logo.svg" alt="Windows" width={20} height={20} className="object-contain" />
                  )}
                </div>
                <span className="text-white text-sm font-bold">
                  {selectedOS === 'android' ? 'Android' : 
                   selectedOS === 'ios' ? 'iOS' :
                   selectedOS === 'macos' ? 'macOS' :
                   selectedOS === 'linux' ? 'Linux' :
                   selectedOS === 'windows' ? 'Windows' : 'OS'}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showOSDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showOSDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl z-50 backdrop-blur-sm">
                <div className="p-3">
                  <button
                    onClick={() => {
                      setSelectedOS('android');
                      setShowOSDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedOS === 'android' 
                        ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                        : 'hover:bg-gray-700 text-gray-200 hover:scale-105'
                    }`}
                  >
                    <Image src="/android_logo.svg" alt="Android" width={20} height={20} className="object-contain flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Android</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOS('ios');
                      setShowOSDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedOS === 'ios' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/apple_logo.svg" alt="iOS" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">iOS</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOS('macos');
                      setShowOSDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedOS === 'macos' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/macos_logo.svg" alt="macOS" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">macOS</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOS('linux');
                      setShowOSDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedOS === 'linux' 
                        ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/linux_logo.svg" alt="Linux" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Linux</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOS('windows');
                      setShowOSDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedOS === 'windows' 
                        ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/windows_logo.svg" alt="Windows" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Windows</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Browser Engine Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowBrowserDropdown(!showBrowserDropdown);
                setShowOSDropdown(false);
              }}
              className="flex items-center justify-between px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-all duration-200 shadow-md hover:shadow-lg w-56"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {selectedBrowser === 'chromium' && (
                    <Image src="/chromium_logo.svg" alt="Chromium" width={20} height={20} className="object-contain" />
                  )}
                  {selectedBrowser === 'webkit' && (
                    <Image src="/webkit_logo.svg" alt="WebKit" width={20} height={20} className="object-contain" />
                  )}
                  {selectedBrowser === 'gecko' && (
                    <Image src="/gecko_logo.svg" alt="Gecko" width={20} height={20} className="object-contain" />
                  )}
                </div>
                <span className="text-white text-sm font-bold">
                  {selectedBrowser === 'chromium' ? 'Chromium' : 
                   selectedBrowser === 'webkit' ? 'WebKit' :
                   selectedBrowser === 'gecko' ? 'Gecko' : 'Browser'}
                </span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showBrowserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showBrowserDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl z-50 backdrop-blur-sm">
                <div className="p-3">
                  <button
                    onClick={() => {
                      setSelectedBrowser('chromium');
                      setShowBrowserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedBrowser === 'chromium' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                        : 'hover:bg-gray-700 text-gray-200 hover:scale-105'
                    }`}
                  >
                    <Image src="/chromium_logo.svg" alt="Chromium" width={20} height={20} className="object-contain flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Chromium</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBrowser('webkit');
                      setShowBrowserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedBrowser === 'webkit' 
                        ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/webkit_logo.svg" alt="WebKit" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">WebKit</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBrowser('gecko');
                      setShowBrowserDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedBrowser === 'gecko' 
                        ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' 
                        : 'hover:bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                    }`}
                    disabled
                  >
                    <Image src="/gecko_logo.svg" alt="Gecko" width={20} height={20} className="object-contain flex-shrink-0 opacity-50" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Gecko</div>
                      <div className="text-xs text-gray-500">Coming Soon</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
            Attack Surface Visualization
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {selectedBrowser.charAt(0).toUpperCase() + selectedBrowser.slice(1)} • {selectedOS.charAt(0).toUpperCase() + selectedOS.slice(1)} Sandbox Escape
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="text-gray-300">
            <span className="text-sm font-medium">Privilege:</span>{' '}
            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold text-white shadow-lg">
              {currentPrivilege}
            </span>
          </div>
          {!isAttackChainComplete && (
            <div className="flex gap-3">
              <button
                onClick={onShowTree}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl border border-purple-400/30"
              >
                View Full Tree
              </button>
              <button
                onClick={onReset}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl border border-blue-400/30"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}