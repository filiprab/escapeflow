import type { AttackVector } from '@/data/attackData';
import { ArrowPathIcon, LightBulbIcon } from '@heroicons/react/24/outline';

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
    <div className="h-full bg-gray-900 flex items-center justify-center p-8">
      <div className="text-center max-w-xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            🎉 Attack Chain Complete!
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            Successfully escalated to <span className="text-red-400 font-bold">{currentPrivilege}</span> privileges
          </p>
          <p className="text-gray-400 text-sm">
            {attackChain.length} step{attackChain.length !== 1 ? 's' : ''} completed
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleResetSimulation}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Start New Attack Simulation
          </button>

          <div className="text-sm text-gray-400 border-t border-gray-700 pt-6">
            <p className="flex items-center justify-center gap-2">
              <LightBulbIcon className="w-4 h-4" />
              View your complete attack path in the left panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}