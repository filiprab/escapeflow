import { OSDropdown } from './OSDropdown';
import { BrowserDropdown } from './BrowserDropdown';

interface PlatformSelectorProps {
  selectedOS: string;
  selectedBrowser: string;
  showOSDropdown: boolean;
  showBrowserDropdown: boolean;
  onOSToggle: () => void;
  onBrowserToggle: () => void;
  onOSSelect: (os: string) => void;
  onBrowserSelect: (browser: string) => void;
}

export function PlatformSelector({
  selectedOS,
  selectedBrowser,
  showOSDropdown,
  showBrowserDropdown,
  onOSToggle,
  onBrowserToggle,
  onOSSelect,
  onBrowserSelect
}: PlatformSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <OSDropdown
        selectedOS={selectedOS}
        showOSDropdown={showOSDropdown}
        onToggle={onOSToggle}
        onSelect={onOSSelect}
      />
      <BrowserDropdown
        selectedBrowser={selectedBrowser}
        showBrowserDropdown={showBrowserDropdown}
        onToggle={onBrowserToggle}
        onSelect={onBrowserSelect}
      />
    </div>
  );
}