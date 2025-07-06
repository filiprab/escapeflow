'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { targetComponents, createAttackVector } from '../data/attackData';
import type { AttackVector } from '../data/attackData';

interface TreeViewProps {
  onAttackSelect: (attack: AttackVector) => void;
  onClose: () => void;
}


const privilegeLevels = [
  'V8 Heap Sandbox',
  'Renderer Process', 
  'GPU Process',
  'Browser Process',
  'System/Root'
];

// Auto-layout function using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 180;
  const nodeHeight = 60;

  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 100, 
    ranksep: 150,
    marginx: 20,
    marginy: 20
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export default function TreeView({ onAttackSelect, onClose }: TreeViewProps) {

  // Generate all nodes and edges dynamically
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Build a map of privilege levels that actually exist in the data
    const usedPrivilegeLevels = new Set<string>();
    targetComponents.forEach(component => {
      usedPrivilegeLevels.add(component.sourcePrivilege);
      usedPrivilegeLevels.add(component.targetPrivilege);
    });
    
    // Create privilege level nodes only for levels that are actually used
    const relevantPrivilegeLevels = privilegeLevels.filter(level => 
      usedPrivilegeLevels.has(level)
    );
    
    // Create privilege level nodes
    relevantPrivilegeLevels.forEach((level) => {
      nodes.push({
        id: `privilege-${level}`,
        data: { 
          label: level, 
          type: 'privilege'
        },
        position: { x: 0, y: 0 }, // Will be set by dagre
        style: {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '13px',
          minWidth: '170px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
        },
      });
    });

    // Create component and technique nodes
    targetComponents.forEach((component, compIndex) => {
      const componentId = `component-${compIndex}`;
      
      // Component node
      nodes.push({
        id: componentId,
        data: { 
          label: component.name,
          type: 'component',
          component: component
        },
        position: { x: 0, y: 0 }, // Will be set by dagre
        style: {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          border: '2px solid #34d399',
          borderRadius: '10px',
          padding: '8px 12px',
          color: 'white',
          fontWeight: '600',
          fontSize: '12px',
          minWidth: '160px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(52, 211, 153, 0.2)',
        },
      });

      // Technique nodes
      component.techniques.forEach((technique, techIndex) => {
        const techniqueId = `technique-${compIndex}-${techIndex}`;
        
        nodes.push({
          id: techniqueId,
          data: { 
            label: technique.name,
            type: 'technique',
            technique: technique,
            component: component
          },
          position: { x: 0, y: 0 }, // Will be set by dagre
          style: {
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            border: '2px solid #f87171',
            borderRadius: '8px',
            padding: '6px 10px',
            color: 'white',
            fontWeight: '500',
            fontSize: '11px',
            minWidth: '120px',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(248, 113, 113, 0.2)',
            cursor: 'pointer',
          },
        });

        // Edge from component to technique
        edges.push({
          id: `edge-${componentId}-${techniqueId}`,
          source: componentId,
          target: techniqueId,
          style: {
            stroke: '#f87171',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f87171',
          },
        });

        // Edge from technique to target privilege (escalation)
        edges.push({
          id: `edge-${techniqueId}-privilege-${component.targetPrivilege}`,
          source: techniqueId,
          target: `privilege-${component.targetPrivilege}`,
          style: {
            stroke: '#f59e0b',
            strokeWidth: 2,
            strokeDasharray: '5,5',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f59e0b',
          },
        });
      });
    });

    // Create edges from privilege levels to components
    targetComponents.forEach((component, compIndex) => {
      const componentId = `component-${compIndex}`;
      
      // Edge from source privilege to component
      edges.push({
        id: `edge-privilege-${component.sourcePrivilege}-${componentId}`,
        source: `privilege-${component.sourcePrivilege}`,
        target: componentId,
        style: {
          stroke: '#34d399',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#34d399',
        },
      });
    });

    // Remove direct privilege level connections since techniques now connect to target privileges

    // Apply dagre layout
    return getLayoutedElements(nodes, edges, 'TB');
  }, []);

  const nodes = layoutedNodes;
  const edges = layoutedEdges;

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.data.type === 'technique') {
      const attackVector = createAttackVector(node.data.component, node.data.technique);
      onAttackSelect(attackVector);
    }
  }, [onAttackSelect]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Comprehensive Attack Tree</h2>
            <p className="text-gray-400 mt-1">
              Complete view of all attack vectors and privilege escalation paths
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 p-4 border-b border-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded border border-blue-400"></div>
            <span className="text-gray-300">Privilege Levels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-700 rounded border border-green-400"></div>
            <span className="text-gray-300">Target Components</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-700 rounded border border-red-400"></div>
            <span className="text-gray-300">Attack Techniques (clickable)</span>
          </div>
        </div>

        {/* Flow Container */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="bg-gray-900"
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            fitView
            fitViewOptions={{ padding: 0.05, includeHiddenNodes: true }}
          >
            <Controls className="bg-gray-800 border-gray-600" />
            <MiniMap 
              className="bg-gray-800 border-gray-600" 
              nodeColor={(node) => {
                if (node.data.type === 'privilege') return '#1e40af';
                if (node.data.type === 'component') return '#10b981';
                if (node.data.type === 'technique') return '#ef4444';
                return '#6b7280';
              }}
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