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
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showOSDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showOSDropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl z-50 backdrop-blur-sm">
          <div className="p-3">
            <button
              onClick={() => onSelect('android')}
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
              onClick={() => onSelect('ios')}
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
              onClick={() => onSelect('macos')}
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
              onClick={() => onSelect('linux')}
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
              onClick={() => onSelect('windows')}
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
  );
}