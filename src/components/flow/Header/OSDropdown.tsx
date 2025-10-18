import Image from 'next/image';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface OSDropdownProps {
  selectedOS: string;
  showOSDropdown: boolean;
  onToggle: () => void;
  onSelect: (os: string) => void;
}

export function OSDropdown({ selectedOS, showOSDropdown, onToggle, onSelect }: OSDropdownProps) {
  return (
    <div className="relative dropdown-container">
      <button
        onClick={onToggle}
        className="dropdown-trigger w-56"
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
          <span className="font-bold">
            {selectedOS === 'android' ? 'Android' :
             selectedOS === 'ios' ? 'iOS' :
             selectedOS === 'macos' ? 'macOS' :
             selectedOS === 'linux' ? 'Linux' :
             selectedOS === 'windows' ? 'Windows' : 'OS'}
          </span>
        </div>
        <ChevronDownIcon className={`dropdown-trigger-icon ${showOSDropdown ? 'open' : ''}`} />
      </button>
      
      {showOSDropdown && (
        <div className="dropdown-menu dropdown-menu-md">
          <div className="dropdown-menu-content">
            <button
              onClick={() => onSelect('android')}
              className={`dropdown-item ${
                selectedOS === 'android'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-default'
              }`}
            >
              <Image src="/android_logo.svg" alt="Android" width={20} height={20} className="object-contain flex-shrink-0" />
              <div className="text-left">
                <div className="text-sm font-medium">Android</div>
              </div>
            </button>
            <button
              onClick={() => onSelect('ios')}
              className={`dropdown-item ${
                selectedOS === 'ios'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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
              onClick={() => onSelect('macos')}
              className={`dropdown-item ${
                selectedOS === 'macos'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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
              onClick={() => onSelect('linux')}
              className={`dropdown-item ${
                selectedOS === 'linux'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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
              onClick={() => onSelect('windows')}
              className={`dropdown-item ${
                selectedOS === 'windows'
                  ? 'dropdown-item-selected'
                  : 'dropdown-item-disabled'
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
  );
}