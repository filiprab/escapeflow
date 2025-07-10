interface HeaderControlsProps {
  isAttackChainComplete: boolean;
  onShowTree: () => void;
  onReset: () => void;
}

export function HeaderControls({ 
  isAttackChainComplete, 
  onShowTree, 
  onReset 
}: HeaderControlsProps) {
  return (
    <div className="flex items-center gap-4">
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
  );
}