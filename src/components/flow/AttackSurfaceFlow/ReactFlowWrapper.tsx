import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AttackVectorNode from '../AttackVectorNode';

const nodeTypes = {
  attackVector: AttackVectorNode,
};

interface ReactFlowWrapperProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export function ReactFlowWrapper({ initialNodes, initialEdges }: ReactFlowWrapperProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initialNodes changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when initialEdges changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
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
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={12} 
        size={1} 
        color="#374151"
      />
    </ReactFlow>
  );
}