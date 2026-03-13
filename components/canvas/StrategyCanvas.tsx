'use client';

import { useCallback, useRef, DragEvent } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Connection,
  useReactFlow,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStrategyStore } from '@/stores/strategyStore';
import { CanvasControls } from './CanvasControls';
import { ConnectionLine } from './ConnectionLine';
import { DataSourceNode } from '@/components/nodes/DataSourceNode';
import { IndicatorNode } from '@/components/nodes/IndicatorNode';
import { ConditionNode } from '@/components/nodes/ConditionNode';
import { CombinerNode } from '@/components/nodes/CombinerNode';
import { SignalNode } from '@/components/nodes/SignalNode';
import { FilterNode } from '@/components/nodes/FilterNode';
import { OutputNode } from '@/components/nodes/OutputNode';
import { HandleType } from '@/engine/types';

const nodeTypes: NodeTypes = {
  datasource: DataSourceNode,
  indicator: IndicatorNode,
  condition: ConditionNode,
  combiner: CombinerNode,
  signal: SignalNode,
  filter: FilterNode,
  output: OutputNode,
};

const NODE_OUTPUT_TYPES: Record<string, HandleType> = {
  datasource: 'candles',
  indicator: 'value',
  condition: 'signal',
  combiner: 'signal',
  filter: 'signal',
  signal: 'action',
};

const NODE_INPUT_TYPES: Record<string, HandleType[]> = {
  indicator: ['candles'],
  condition: ['value'],
  combiner: ['signal'],
  filter: ['signal'],
  signal: ['signal'],
  output: ['action'],
};

function getDefaultNodeData(nodeType: string): Record<string, unknown> {
  switch (nodeType) {
    case 'datasource':
      return {
        label: 'Data Source',
        category: 'datasource',
        status: 'idle',
        symbol: 'EQUITY:SPY',
        timeframe: '1d',
        dateFrom: '2020-01-01',
        dateTo: '2024-01-01',
      };
    case 'indicator':
      return {
        label: 'Indicator',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'SMA',
        params: { period: 20 },
      };
    case 'condition':
      return {
        label: 'Condition',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_above',
        constantValue: 0,
        useConstant: false,
      };
    case 'combiner':
      return {
        label: 'Combiner',
        category: 'combiner',
        status: 'idle',
        mode: 'AND',
      };
    case 'signal':
      return {
        label: 'Signal',
        category: 'signal',
        status: 'idle',
        direction: 'buy',
        sizing: 100,
        signalLabel: 'Buy Signal',
      };
    case 'filter':
      return {
        label: 'Filter',
        category: 'filter',
        status: 'idle',
        filterType: 'cooldown',
        params: { bars: 5 },
      };
    case 'output':
      return {
        label: 'Output',
        category: 'output',
        status: 'idle',
        strategyName: 'My Strategy',
        initialCapital: 10000,
      };
    default:
      return { label: 'Node', category: 'output' as const, status: 'idle' as const };
  }
}

function CanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useStrategyStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const isValidConnection = useCallback((connection: Connection | { source: string; target: string; sourceHandle?: string | null | undefined; targetHandle?: string | null | undefined }) => {
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return false;
    if (connection.source === connection.target) return false;

    const sourceType = NODE_OUTPUT_TYPES[sourceNode.type || ''];
    const targetTypes = NODE_INPUT_TYPES[targetNode.type || ''];

    if (!sourceType || !targetTypes) return false;
    return targetTypes.includes(sourceType);
  }, [nodes]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (isValidConnection(connection)) {
        onConnect(connection);
      }
    },
    [isValidConnection, onConnect]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/signaflow-node');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      addNode(newNode);
      setSelectedNodeId(newNode.id);
    },
    [screenToFlowPosition, addNode, setSelectedNodeId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="dot-grid-bg"
      >
        <CanvasControls />
      </ReactFlow>
    </div>
  );
}

export function StrategyCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
