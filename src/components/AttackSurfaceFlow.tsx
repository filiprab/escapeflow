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
  MarkerType,
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
    
    // If we've reached root and have an attack chain, show the attack chain visualization
    if (availableComponents.length === 0 && 
        (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && 
        attackChain.length > 0) {
      
      // Generate attack chain nodes
      const allPrivileges: string[] = [];
      
      // Collect all unique privilege levels in order
      if (attackChain[0]) {
        allPrivileges.push(attackChain[0].sourcePrivilege);
      }
      
      attackChain.forEach(attack => {
        if (!allPrivileges.includes(attack.targetPrivilege)) {
          allPrivileges.push(attack.targetPrivilege);
        }
      });

      return allPrivileges.map((privilege, index) => ({
        id: `chain-node-${index}`,
        data: { 
          label: privilege 
        },
        position: { 
          x: 400, 
          y: 100 + index * 120 
        },
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          border: '2px solid #06b6d4',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          fontWeight: 'bold',
          minWidth: '180px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(6, 182, 212, 0.2)',
        },
      }));
    }
    
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
  }, [currentPrivilege, onAttackSelect, onPrivilegeEscalation, attackChain]);

  // Generate edges showing attack paths
  const initialEdges: Edge[] = useMemo(() => {
    const availableComponents = getAvailableComponents(currentPrivilege);
    
    // If we're showing the attack chain, generate edges between chain nodes
    if (availableComponents.length === 0 && 
        (currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && 
        attackChain.length > 0) {
      
      return attackChain.map((attack, index) => ({
        id: `chain-edge-${index}`,
        source: `chain-node-${index}`,
        target: `chain-node-${index + 1}`,
        label: attack.name.split(': ')[1] || attack.name,
        style: {
          stroke: '#ef4444',
          strokeWidth: 3,
        },
        labelStyle: {
          fill: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        labelBgStyle: {
          fill: '#1f2937',
          fillOpacity: 0.9,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ef4444',
        },
      }));
    }
    
    // No edges for regular attack components view
    return [];
  }, [currentPrivilege, attackChain]);

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
       !((currentPrivilege === 'System/Root' || currentPrivilege === 'Kernel/Root') && attackChain.length > 0) ? (
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