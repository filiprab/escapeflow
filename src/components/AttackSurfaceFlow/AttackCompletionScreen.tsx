import type { AttackVector } from '@/data/attackData';

interface AttackCompletionScreenProps {
  currentPrivilege: string;
  attackChain: AttackVector[];
}

export function AttackCompletionScreen({ currentPrivilege, attackChain }: AttackCompletionScreenProps) {
  const handleResetSimulation = () => {
    const event = new CustomEvent('resetSimulation');
    window.dispatchEvent(event);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Attack Chain Complete!
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            Congratulations! You&apos;ve successfully escalated to <span className="text-red-400 font-bold">{currentPrivilege}</span> privileges.
          </p>
          <p className="text-gray-400">
            Your attack chain consists of {attackChain.length} step{attackChain.length !== 1 ? 's' : ''} across multiple privilege levels.
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">What would you like to do next?</h3>
          <div className="flex justify-center">
            <button
              onClick={handleResetSimulation}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
            >
              🔄 Start New Attack Simulation
            </button>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-semibold text-white mb-2">🎯 Attack Summary</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>✓ Successfully compromised {attackChain.length} privilege level{attackChain.length !== 1 ? 's' : ''}</p>
            <p>✓ Used {attackChain.length} different attack technique{attackChain.length !== 1 ? 's' : ''}</p>
            <p>✓ Achieved <span className="text-red-400 font-semibold">{currentPrivilege}</span> access</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              💡 Your complete attack path is visible in the left panel with detailed technique information and export options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}