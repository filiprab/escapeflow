import Image from 'next/image';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface BrowserDropdownProps {
  selectedBrowser: string;
  showBrowserDropdown: boolean;
  onToggle: () => void;
  onSelect: (browser: string) => void;
}

export function BrowserDropdown({ selectedBrowser, showBrowserDropdown, onToggle, onSelect }: BrowserDropdownProps) {
  return (
    <div className="relative dropdown-container">
      <button
        onClick={onToggle}
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
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showBrowserDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showBrowserDropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl z-50 backdrop-blur-sm">
          <div className="p-3">
            <button
              onClick={() => onSelect('chromium')}
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
              onClick={() => onSelect('webkit')}
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
              onClick={() => onSelect('gecko')}
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
  );
}