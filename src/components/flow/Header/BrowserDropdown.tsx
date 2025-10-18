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
        className="dropdown-trigger w-56"
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
          <span className="font-bold">
            {selectedBrowser === 'chromium' ? 'Chromium' :
             selectedBrowser === 'webkit' ? 'WebKit' :
             selectedBrowser === 'gecko' ? 'Gecko' : 'Browser'}
          </span>
        </div>
        <ChevronDownIcon className={`dropdown-trigger-icon ${showBrowserDropdown ? 'open' : ''}`} />
      </button>

      {showBrowserDropdown && (
        <div className="dropdown-menu dropdown-menu-md">
          <div className="dropdown-menu-content">
            <button
              onClick={() => onSelect('chromium')}
              className={`dropdown-item ${
                selectedBrowser === 'chromium'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-default'
              }`}
            >
              <Image src="/chromium_logo.svg" alt="Chromium" width={20} height={20} className="object-contain flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm font-medium">Chromium</div>
              </div>
            </button>
            <button
              onClick={() => onSelect('webkit')}
              className={`dropdown-item ${
                selectedBrowser === 'webkit'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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
              className={`dropdown-item ${
                selectedBrowser === 'gecko'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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