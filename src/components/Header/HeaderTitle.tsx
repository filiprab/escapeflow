interface HeaderTitleProps {
  selectedBrowser: string;
  selectedOS: string;
}

export function HeaderTitle({ selectedBrowser, selectedOS }: HeaderTitleProps) {
  return (
    <div className="text-center flex-1">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
        Attack Surface Visualization
      </h1>
      <p className="text-sm text-gray-400 mt-1">
        {selectedBrowser.charAt(0).toUpperCase() + selectedBrowser.slice(1)} • {selectedOS.charAt(0).toUpperCase() + selectedOS.slice(1)} Sandbox Escape
      </p>
    </div>
  );
}