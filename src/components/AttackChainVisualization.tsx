'use client';

import { useCallback, useMemo } from 'react';
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
} from 'reactflow';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import type { AttackVector } from '../data/attackData';

interface AttackChainVisualizationProps {
  attackChain: AttackVector[];
  onClose: () => void;
}

export default function AttackChainVisualization({ attackChain, onClose }: AttackChainVisualizationProps) {
  // Generate nodes for the attack chain
  const chainNodes: Node[] = useMemo(() => {
    return attackChain.map((attack, index) => ({
      id: attack.id,
      position: { x: index * 300, y: 100 },
      data: {
        label: (
          <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-500 rounded-xl min-w-[250px]">
            <h3 className="text-white font-bold text-sm mb-2">{attack.name}</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Step:</span>
                <span className="text-cyan-400 font-semibold">{index + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CVEs:</span>
                <span className="text-red-400 font-semibold">{attack.cves.length}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="text-xs text-center">
                <span className="text-gray-400">{attack.sourcePrivilege}</span>
                <span className="text-red-400 mx-2">→</span>
                <span className="text-green-400">{attack.targetPrivilege}</span>
              </div>
            </div>
          </div>
        ),
      },
      type: 'default',
    }));
  }, [attackChain]);

  // Generate edges connecting the attack chain
  const chainEdges: Edge[] = useMemo(() => {
    return attackChain.slice(0, -1).map((_, index) => ({
      id: `edge-${index}`,
      source: attackChain[index].id,
      target: attackChain[index + 1].id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 3 },
      label: `Step ${index + 1} → ${index + 2}`,
      labelStyle: { fill: '#ffffff', fontWeight: 'bold' },
      labelBgStyle: { fill: '#1f2937', fillOpacity: 0.8 },
    }));
  }, [attackChain]);

  // Export functions
  const downloadImage = useCallback(
    (dataUrl: string, filename: string) => {
      const a = document.createElement('a');
      a.setAttribute('download', filename);
      a.setAttribute('href', dataUrl);
      a.click();
    },
    []
  );

  const onSaveAsPng = useCallback(() => {
    const nodesBounds = getRectOfNodes(chainNodes);
    const transform = getTransformForBounds(nodesBounds, 1200, 800, 0.5, 2);
    
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#111827',
        width: 1200,
        height: 800,
        style: {
          width: '1200px',
          height: '800px',
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        downloadImage(dataUrl, 'chromium-attack-chain.png');
      });
    }
  }, [chainNodes, downloadImage]);

  const onSaveAsJpeg = useCallback(() => {
    const nodesBounds = getRectOfNodes(chainNodes);
    const transform = getTransformForBounds(nodesBounds, 1200, 800, 0.5, 2);
    
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toJpeg(viewport, {
        backgroundColor: '#111827',
        width: 1200,
        height: 800,
        style: {
          width: '1200px',
          height: '800px',
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        downloadImage(dataUrl, 'chromium-attack-chain.jpg');
      });
    }
  }, [chainNodes, downloadImage]);

  const onSaveAsSvg = useCallback(() => {
    const nodesBounds = getRectOfNodes(chainNodes);
    const transform = getTransformForBounds(nodesBounds, 1200, 800, 0.5, 2);
    
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toSvg(viewport, {
        backgroundColor: '#111827',
        width: 1200,
        height: 800,
        style: {
          width: '1200px',
          height: '800px',
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        downloadImage(dataUrl, 'chromium-attack-chain.svg');
      });
    }
  }, [chainNodes, downloadImage]);

  const onSaveAsJson = useCallback(() => {
    const chainData = {
      metadata: {
        title: 'Chromium Android Sandbox Escape Attack Chain',
        date: new Date().toISOString(),
        totalSteps: attackChain.length,
        finalPrivilege: attackChain[attackChain.length - 1]?.targetPrivilege || 'Unknown',
      },
      attackChain: attackChain.map((attack, index) => ({
        step: index + 1,
        attackName: attack.name,
        sourcePrivilege: attack.sourcePrivilege,
        targetPrivilege: attack.targetPrivilege,
        cves: attack.cves,
        pocs: attack.pocs,
        description: attack.description,
        mitigations: attack.mitigations,
      })),
    };

    const dataStr = JSON.stringify(chainData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    downloadImage(dataUri, 'chromium-attack-chain.json');
  }, [attackChain, downloadImage]);

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
              Complete attack path: {attackChain.length} steps to {attackChain[attackChain.length - 1]?.targetPrivilege}
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onSaveAsPng}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              PNG
            </button>
            <button
              onClick={onSaveAsJpeg}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              JPEG
            </button>
            <button
              onClick={onSaveAsSvg}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              SVG
            </button>
            <button
              onClick={onSaveAsJson}
              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              JSON
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
            nodes={chainNodes}
            edges={chainEdges}
            fitView
            attributionPosition="top-right"
            className="bg-gray-900"
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
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
        </div>
      </div>
    </div>
  );
} 