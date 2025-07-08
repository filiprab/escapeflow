'use client';

import AttackSurfaceFlow from '../components/AttackSurfaceFlow';
import AttackDetails from '../components/AttackDetails';
import AttackChainPanel from '../components/AttackChainPanel';
import TreeView from '../components/TreeView';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const {
    selectedAttack,
    currentPrivilege,
    attackChain,
    showChainPanel,
    showTree,
    handleAttackSelect,
    handlePrivilegeEscalation,
    handleToggleChainPanel,
    handleCloseTree,
  } = useAppContext();

  return (
    <div className="relative h-[calc(100vh-88px)]">
      {/* Attack Chain Panel */}
      <AttackChainPanel
        attackChain={attackChain}
        isOpen={showChainPanel}
        onToggle={handleToggleChainPanel}
      />

      {/* Main Content */}
      <div 
        className={`flex h-full transition-all duration-300 ${
          showChainPanel ? 'ml-80' : 'ml-0'
        }`}
      >
        {/* Flow Container */}
        <div className="flex-1 bg-gray-900/50 border-r border-gray-700">
          <AttackSurfaceFlow
            onAttackSelect={handleAttackSelect}
            currentPrivilege={currentPrivilege}
            onPrivilegeEscalation={handlePrivilegeEscalation}
            attackChain={attackChain}
          />
        </div>

        {/* Details Panel */}
        {selectedAttack && (
          <div className="w-96 bg-gray-800/95 backdrop-blur-lg border-l border-gray-700 overflow-y-auto">
            <AttackDetails attack={selectedAttack} />
          </div>
        )}
      </div>

      {/* Comprehensive Tree View Modal */}
      {showTree && (
        <TreeView
          onAttackSelect={handleAttackSelect}
          onClose={handleCloseTree}
        />
      )}
    </div>
  );
}
