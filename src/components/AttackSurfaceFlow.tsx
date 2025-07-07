'use client';

import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AttackVectorNode from './AttackVectorNode';
import { getAvailableComponents, createAttackVector } from '../data/attackData';
import type { AttackVector, TargetComponent, ExploitationTechnique } from '../data/attackData';

interface AttackSurfaceFlowProps {
  onAttackSelect: (attack: AttackVector) => void;
  currentPrivilege: string;
  onPrivilegeEscalation: (newPrivilege: string, attack: AttackVector) => void;
  attackChain: AttackVector[];
}

const nodeTypes = {
  attackVector: AttackVectorNode,
};

export default function AttackSurfaceFlow({
  onAttackSelect,
  currentPrivilege,
  onPrivilegeEscalation,
  attackChain,
}: AttackSurfaceFlowProps) {
  // Generate nodes based on current privilege level or attack chain completion
  const initialNodes: Node[] = useMemo(() => {
    const availableComponents = getAvailableComponents(currentPrivilege);
    
    // Otherwise, show available attack components
    return availableComponents.map((component, index) => ({
      id: component.id,
      type: 'attackVector',
      position: { 
        x: 200 + (index % 3) * 400, 
        y: 100 + Math.floor(index / 3) * 250 
      },
      data: {
        component,
        onSelect: (selectedComponent: TargetComponent, technique?: ExploitationTechnique) => {
          if (technique) {
            const attackVector = createAttackVector(selectedComponent, technique);
            onAttackSelect(attackVector);
          }
        },
        onEscalate: (selectedComponent: TargetComponent, technique: ExploitationTechnique) => {
          const attackVector = createAttackVector(selectedComponent, technique);
          onPrivilegeEscalation(selectedComponent.targetPrivilege, attackVector);
        },
        isAvailable: true,
      },
    }));
  }, [currentPrivilege, onAttackSelect, onPrivilegeEscalation]);

  // Generate edges showing attack paths
  const initialEdges: Edge[] = useMemo(() => [], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when privilege level changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when privilege level or attack chain changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const availableComponents = getAvailableComponents(currentPrivilege);

  return (
    <div className="w-full h-full relative">
      {availableComponents.length === 0 && 
       (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && 
       attackChain.length > 0 ? (
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
                  onClick={() => {
                    // This will be handled by the parent component
                    const event = new CustomEvent('resetSimulation');
                    window.dispatchEvent(event);
                  }}
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
      ) : availableComponents.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              No attack targets available
            </h2>
            <p className="text-gray-400">
              {`No attack targets available for privilege level: ${currentPrivilege}`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            attributionPosition="top-right"
            className="bg-gray-900"
          >
            <Controls className="bg-gray-800 border-gray-600" />
            <MiniMap 
              className="bg-gray-800 border-gray-600" 
              nodeColor="#374151"
              maskColor="rgba(0, 0, 0, 0.2)"
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={12} 
              size={1} 
              color="#374151"
            />
          </ReactFlow>
        </>
      )}
    </div>
  );
} 