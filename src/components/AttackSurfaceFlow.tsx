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
}

const nodeTypes = {
  attackVector: AttackVectorNode,
};

export default function AttackSurfaceFlow({
  onAttackSelect,
  currentPrivilege,
  onPrivilegeEscalation,
}: AttackSurfaceFlowProps) {
  // Generate nodes based on current privilege level
  const initialNodes: Node[] = useMemo(() => {
    const availableComponents = getAvailableComponents(currentPrivilege);
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

  // Generate edges showing attack paths - no edges within same privilege level
  const initialEdges: Edge[] = useMemo(() => {
    // No edges needed within the same privilege level
    // Edges will be shown conceptually through the privilege escalation flow
    return [];
  }, [currentPrivilege]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when privilege level changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when privilege level changes
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
      {availableComponents.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root' 
                ? '🎉 Root Access Achieved!' 
                : 'No attack targets available'}
            </h2>
            <p className="text-gray-400">
              {currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root'
                ? 'You have successfully escalated to the highest privilege level on the Android device!'
                : `No attack targets available for privilege level: ${currentPrivilege}`}
            </p>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
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
      )}
    </div>
  );
} 