'use client';

import AttackSurfaceFlow from '@/components/flow/AttackSurfaceFlow';
import AttackChainPanel from '@/components/flow/AttackChainPanel';
import PrivilegePanel from '@/components/flow/PrivilegePanel';
import AttackDetailsPanel from '@/components/flow/AttackDetailsPanel';
import TreeView from '@/components/flow/TreeView';
import { useAppContext } from '@/context/AppContext';

export default function FlowPage() {
  const {
    selectedAttack,
    currentPrivilege,
    attackChain,
    showChainPanel,
    showTree,
    showPrivilegePanel,
    handleAttackSelect,
    handlePrivilegeEscalation,
    handleToggleChainPanel,
    handleTogglePrivilegePanel,
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

      {/* Privilege Panel */}
      <PrivilegePanel
        currentPrivilege={currentPrivilege}
        isOpen={showPrivilegePanel}
        onToggle={handleTogglePrivilegePanel}
        attackChainPanelOpen={showChainPanel}
      />

      {/* Attack Details Panel */}
      <AttackDetailsPanel
        selectedAttack={selectedAttack}
      />

      {/* Main Content */}
      <div 
        className={`flex transition-all duration-300 ${
          showChainPanel ? 'ml-80' : 'ml-0'
        } ${
          showPrivilegePanel ? 'h-[calc(100%-16rem)]' : 'h-full'
        } mr-96`}
      >
        {/* Flow Container */}
        <div className="flex-1 bg-gray-900/50">
          <AttackSurfaceFlow
            onAttackSelect={handleAttackSelect}
            currentPrivilege={currentPrivilege}
            onPrivilegeEscalation={handlePrivilegeEscalation}
            attackChain={attackChain}
          />
        </div>
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