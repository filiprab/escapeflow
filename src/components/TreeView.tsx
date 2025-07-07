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
import dagre from 'dagre';
import { targetComponents } from '../data/attackData';
import type { AttackVector, PrivilegeInfo, ExploitationTechnique, TargetComponent } from '../data/attackData';

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

export default function TreeView({ onClose }: TreeViewProps) {
  const [selectedPrivilege, setSelectedPrivilege] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<{technique: ExploitationTechnique, component: TargetComponent} | null>(null);

  // Helper function to get privilege information
  const getPrivilegeInfo = (privilegeLevel: string): PrivilegeInfo | null => {
    for (const component of targetComponents) {
      if (component.sourcePrivilegeInfo?.level === privilegeLevel) {
        return component.sourcePrivilegeInfo;
      }
      if (component.targetPrivilegeInfo?.level === privilegeLevel) {
        return component.targetPrivilegeInfo;
      }
    }
    return null;
  };


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

    // Remove direct privilege level connections since techniques now connect to target privileges

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-2xl w-[90vw] max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">{selectedPrivilege} - Privilege Level Details</h3>
              <button
                onClick={() => setSelectedPrivilege(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {(() => {
                const privInfo = getPrivilegeInfo(selectedPrivilege);
                if (!privInfo) {
                  return (
                    <div className="text-gray-400 text-center py-8">
                      No detailed information available for this privilege level.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 uppercase tracking-wide mb-3">Capabilities</h4>
                      <ul className="text-gray-300 space-y-2">
                        {privInfo.capabilities.map((cap, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-400 mr-3 mt-1">✓</span>
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-red-400 uppercase tracking-wide mb-3">Restrictions</h4>
                      <ul className="text-gray-300 space-y-2">
                        {privInfo.restrictions.map((rest, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-400 mr-3 mt-1">✗</span>
                            <span>{rest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 uppercase tracking-wide mb-3">Command Examples</h4>
                      <div className="bg-gray-900/60 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
                        {privInfo.examples.map((example, idx) => (
                          <div key={idx} className="text-gray-300">
                            <span className="text-blue-400">$</span> {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Attack Technique Popup Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl border border-gray-600 max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-600">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTechnique.technique.name}</h3>
                <p className="text-gray-400 mt-1">Attack Technique in {selectedTechnique.component.name}</p>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-blue-400 uppercase tracking-wide mb-3">Description</h4>
                <p className="text-gray-300 leading-relaxed">{selectedTechnique.technique.detailedDescription}</p>
              </div>
              
              {/* Context-Specific Impact */}
              <div>
                <h4 className="text-lg font-semibold text-orange-400 uppercase tracking-wide mb-3">
                  What This Means For The Attacker
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Impact when exploiting {selectedTechnique.technique.name} in {selectedTechnique.component.name}:
                </p>
                <ul className="text-gray-300 space-y-2">
                  {(selectedTechnique.technique.contextSpecificImpact || ['Context-specific impact information not available for this combination.']).map((impact: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-400 mr-3 mt-1">⚡</span>
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* CVEs and PoCs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-red-400 uppercase tracking-wide mb-3">
                    CVEs ({selectedTechnique.technique.cves.length})
                  </h4>
                  {selectedTechnique.technique.cves.length > 0 ? (
                    <ul className="text-gray-300 space-y-1">
                      {selectedTechnique.technique.cves.map((cve: string, idx: number) => (
                        <li key={idx} className="font-mono text-sm bg-gray-700/50 px-3 py-1 rounded">
                          {cve}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No CVEs listed for this technique.</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-orange-400 uppercase tracking-wide mb-3">
                    Proof of Concepts ({selectedTechnique.technique.pocs.length})
                  </h4>
                  {selectedTechnique.technique.pocs.length > 0 ? (
                    <ul className="text-gray-300 space-y-1">
                      {selectedTechnique.technique.pocs.map((poc: string, idx: number) => (
                        <li key={idx} className="text-sm">
                          <a href={poc} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300 underline break-all">
                            {poc}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No PoCs listed for this technique.</p>
                  )}
                </div>
              </div>
              
              {/* Mitigations */}
              <div>
                <h4 className="text-lg font-semibold text-green-400 uppercase tracking-wide mb-3">Mitigations</h4>
                <ul className="text-gray-300 space-y-2">
                  {selectedTechnique.technique.mitigations.map((mitigation: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">🛡️</span>
                      <span>{mitigation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* References */}
              {selectedTechnique.technique.references.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 uppercase tracking-wide mb-3">References</h4>
                  <ul className="text-gray-300 space-y-1">
                    {selectedTechnique.technique.references.map((ref: string, idx: number) => (
                      <li key={idx} className="text-sm">
                        <a href={ref} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 underline break-all">
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}