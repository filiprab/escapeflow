import { EscapeFlowLogo } from '../EscapeFlowLogo';

interface HeaderTitleProps {
  selectedBrowser: string;
  selectedOS: string;
}

export function HeaderTitle({ selectedBrowser, selectedOS }: HeaderTitleProps) {
  return (
    <div className="text-center flex-1">
      <div className="flex items-center justify-center gap-3 mb-1">
        <EscapeFlowLogo width={32} height={32} />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
          EscapeFlow
        </h1>
      </div>
      <p className="text-sm text-gray-400">
        {selectedBrowser.charAt(0).toUpperCase() + selectedBrowser.slice(1)} • {selectedOS.charAt(0).toUpperCase() + selectedOS.slice(1)} Sandbox Escape
      </p>
    </div>
  );
}