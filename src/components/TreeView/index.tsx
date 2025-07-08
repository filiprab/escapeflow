'use client';

import { useMemo, useCallback, useState } from 'react';
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
import { targetComponents } from '@/data/attackData';
import type { AttackVector, ExploitationTechnique, TargetComponent } from '@/data/attackData';
import { getLayoutedElements } from './layout';
import { PrivilegeModal } from './PrivilegeModal';
import { TechniqueModal } from './TechniqueModal';

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

export default function TreeView({ onClose }: TreeViewProps) {
  const [selectedPrivilege, setSelectedPrivilege] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<{technique: ExploitationTechnique, component: TargetComponent} | null>(null);

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
          cursor: 'pointer',
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
        
        // Create custom technique node content with badges
        const techniqueLabel = (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '4px' }}>{technique.name}</div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {technique.cves.length > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: '1'
                }}>
                  CVE {technique.cves.length}
                </span>
              )}
              {technique.pocs.length > 0 && (
                <span style={{
                  backgroundColor: '#f97316',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: '1'
                }}>
                  PoC {technique.pocs.length}
                </span>
              )}
            </div>
          </div>
        );

        nodes.push({
          id: techniqueId,
          data: { 
            label: techniqueLabel,
            type: 'technique',
            technique: technique,
            component: component
          },
          position: { x: 0, y: 0 }, // Will be set by dagre
          style: {
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            border: '2px solid #f87171',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontWeight: '500',
            fontSize: '11px',
            minWidth: '140px',
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

    // Apply dagre layout
    return getLayoutedElements(nodes, edges, 'TB');
  }, []);

  const nodes = layoutedNodes;
  const edges = layoutedEdges;

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.data.type === 'technique') {
      setSelectedTechnique({
        technique: node.data.technique,
        component: node.data.component
      });
    } else if (node.data.type === 'privilege') {
      setSelectedPrivilege(node.data.label);
    }
  }, []);

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
            <span className="text-gray-300">Privilege Levels (clickable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-700 rounded border border-green-400"></div>
            <span className="text-gray-300">Target Components</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-700 rounded border border-red-400"></div>
            <span className="text-gray-300">Attack Techniques (clickable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">CVE Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-300">PoC Count</span>
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
      
      {/* Privilege Level Popup Modal */}
      {selectedPrivilege && (
        <PrivilegeModal 
          selectedPrivilege={selectedPrivilege}
          onClose={() => setSelectedPrivilege(null)}
        />
      )}
      
      {/* Attack Technique Popup Modal */}
      {selectedTechnique && (
        <TechniqueModal 
          selectedTechnique={selectedTechnique}
          onClose={() => setSelectedTechnique(null)}
        />
      )}
    </div>
  );
}