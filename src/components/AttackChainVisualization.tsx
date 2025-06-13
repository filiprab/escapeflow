'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  getRectOfNodes,
  getTransformForBounds,
  MarkerType,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import { toPng } from 'html-to-image';
import type { AttackVector } from '../data/attackData';

interface AttackChainVisualizationProps {
  attackChain: AttackVector[];
  onClose: () => void;
}

export default function AttackChainVisualization({ attackChain, onClose }: AttackChainVisualizationProps) {
  // Generate initial nodes
  const initialNodes: Node[] = useMemo(() => {
    if (attackChain.length === 0) return [];

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
        id: `node-${index}`,
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
  }, [attackChain]);

  // State for managing node positions
  const [nodes, setNodes] = useState<Node[]>(initialNodes);

  // Handle node position changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Update nodes when attackChain changes
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Generate edges - simple approach
  const edges: Edge[] = useMemo(() => {
    return attackChain.map((attack, index) => ({
      id: `edge-${index}`,
      source: `node-${index}`,
      target: `node-${index + 1}`,
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
  }, [attackChain]);

  // Export to PNG using ReactFlow's built-in methods
  const downloadImage = useCallback(() => {
    const nodesBounds = getRectOfNodes(nodes);
    const imageWidth = nodesBounds.width + 200;
    const imageHeight = nodesBounds.height + 200;
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#111827',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'attack-chain.png';
        link.href = dataUrl;
        link.click();
      });
    }
  }, [nodes]);

  // Export to JSON
  const downloadJSON = useCallback(() => {
    const data = {
      attackChain: attackChain.map((attack, index) => ({
        step: index + 1,
        name: attack.name,
        source: attack.sourcePrivilege,
        target: attack.targetPrivilege,
        technique: attack.name.split(': ')[1] || attack.name,
      })),
      metadata: {
        totalSteps: attackChain.length,
        exportDate: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  // Export to PlantUML
  const downloadPlantUML = useCallback(() => {
    const lines = ['@startuml', 'title Attack Chain Visualization', ''];
    
    // Add nodes as activities
    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }
    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    lines.push('start');
    allPrivileges.forEach((privilege, index) => {
      if (index === 0) {
        lines.push(`:${privilege};`);
      } else {
        const attack = attackChain[index - 1];
        const technique = attack ? (attack.name.split(': ')[1] || attack.name) : 'Unknown';
        lines.push(`note right : ${technique}`);
        lines.push(`:${privilege};`);
      }
    });
    lines.push('stop');
    
    lines.push('', '@enduml');
    
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.puml';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  // Export to Mermaid
  const downloadMermaid = useCallback(() => {
    const lines = ['graph TD'];
    
    // Generate node IDs and labels
    const allPrivileges: string[] = [];
    if (attackChain[0]) {
      allPrivileges.push(attackChain[0].sourcePrivilege);
    }
    attackChain.forEach(attack => {
      if (!allPrivileges.includes(attack.targetPrivilege)) {
        allPrivileges.push(attack.targetPrivilege);
      }
    });

    // Add nodes
    allPrivileges.forEach((privilege, index) => {
      const nodeId = `node${index}`;
      lines.push(`    ${nodeId}["${privilege}"]`);
    });

    // Add edges with attack techniques as labels
    attackChain.forEach((attack, index) => {
      const sourceId = `node${index}`;
      const targetId = `node${index + 1}`;
      const technique = attack.name.split(': ')[1] || attack.name;
      lines.push(`    ${sourceId} -->|"${technique}"| ${targetId}`);
    });

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'attack-chain.mmd';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [attackChain]);

  if (attackChain.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Attack Chain Visualization</h2>
            <p className="text-gray-400 mt-1">
              {attackChain.length} step attack chain to {attackChain[attackChain.length - 1]?.targetPrivilege}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export PNG
            </button>
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={downloadPlantUML}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export PlantUML
            </button>
            <button
              onClick={downloadMermaid}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export Mermaid
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Flow Container */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            className="bg-gray-900"
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Controls className="bg-gray-800 border-gray-600" />
            <MiniMap 
              className="bg-gray-800 border-gray-600" 
              nodeColor="#1f2937"
              maskColor="rgba(0, 0, 0, 0.2)"
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={12} 
              size={1} 
              color="#374151"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
} 