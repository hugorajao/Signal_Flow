import {
  StrategyNode,
  StrategyEdge,
  CompiledStrategy,
  DataSourceNodeData,
  IndicatorNodeData,
  ConditionNodeData,
  CombinerNodeData,
  SignalNodeData,
  FilterNodeData,
  OutputNodeData,
  DataSourceConfig,
  SignalConfig,
  PipelineStep,
  NodeCategory,
} from './types';

export class CompilationError extends Error {
  constructor(message: string, public nodeIds?: string[]) {
    super(message);
    this.name = 'CompilationError';
  }
}

/**
 * Compile a visual node graph into an executable strategy.
 *
 * Steps:
 * 1. Find the Output node (error if none or multiple)
 * 2. Topological sort (detect cycles)
 * 3. Resolve execution order by category
 * 4. Extract DataSourceConfig, PipelineSteps, SignalConfig
 * 5. Return CompiledStrategy
 */
export function compileStrategy(
  nodes: StrategyNode[],
  edges: StrategyEdge[]
): CompiledStrategy {
  // --- 1. Find Output node ---
  const outputNodes = nodes.filter((n) => n.data.category === 'output');
  if (outputNodes.length === 0) {
    throw new CompilationError('No Output node found. Add an Output node to the graph.');
  }
  if (outputNodes.length > 1) {
    throw new CompilationError(
      'Multiple Output nodes found. Only one Output node is allowed.',
      outputNodes.map((n) => n.id)
    );
  }
  const outputNode = outputNodes[0];
  const outputData = outputNode.data as OutputNodeData;

  // --- Build adjacency structures ---
  const adjacency = buildAdjacency(nodes, edges);

  // --- 2. Topological sort ---
  const sortedIds = topologicalSort(nodes, adjacency);

  // --- 3. Categorize nodes in execution order ---
  const nodeMap = new Map<string, StrategyNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Build incoming edges map: target -> {targetHandle -> sourceNodeId}
  const incomingEdges = new Map<string, Map<string, string>>();
  for (const edge of edges) {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, new Map());
    }
    const handleKey = edge.targetHandle ?? 'default';
    incomingEdges.get(edge.target)!.set(handleKey, edge.source);
  }

  // Also build a simple incoming list: target -> source[]
  const incomingSources = new Map<string, string[]>();
  for (const edge of edges) {
    if (!incomingSources.has(edge.target)) {
      incomingSources.set(edge.target, []);
    }
    incomingSources.get(edge.target)!.push(edge.source);
  }

  // --- 4. Extract DataSourceConfigs ---
  const dataSources: DataSourceConfig[] = [];
  const pipeline: PipelineStep[] = [];
  const entrySignals: SignalConfig[] = [];
  const exitSignals: SignalConfig[] = [];

  for (const nodeId of sortedIds) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const category = node.data.category;

    switch (category) {
      case 'datasource': {
        const data = node.data as DataSourceNodeData;
        dataSources.push({
          nodeId: node.id,
          symbol: data.symbol,
          timeframe: data.timeframe,
          from: data.dateFrom,
          to: data.dateTo,
        });
        break;
      }

      case 'indicator': {
        const data = node.data as IndicatorNodeData;
        const inputs = resolveInputs(node.id, incomingEdges);
        pipeline.push({
          nodeId: node.id,
          type: 'indicator',
          fn: data.indicatorType,
          params: { ...data.params } as Record<string, string | number | boolean>,
          inputs,
        });
        break;
      }

      case 'condition': {
        const data = node.data as ConditionNodeData;
        const inputs = resolveInputs(node.id, incomingEdges);
        const params: Record<string, string | number | boolean> = {
          operator: data.operator,
          useConstant: data.useConstant,
        };
        if (data.constantValue !== undefined) {
          params.constantValue = data.constantValue;
        }
        pipeline.push({
          nodeId: node.id,
          type: 'condition',
          fn: data.operator,
          params,
          inputs,
        });
        break;
      }

      case 'combiner': {
        const data = node.data as CombinerNodeData;
        const inputs = resolveInputs(node.id, incomingEdges);
        pipeline.push({
          nodeId: node.id,
          type: 'combiner',
          fn: data.mode,
          params: { mode: data.mode },
          inputs,
        });
        break;
      }

      case 'filter': {
        const data = node.data as FilterNodeData;
        const inputs = resolveInputs(node.id, incomingEdges);
        pipeline.push({
          nodeId: node.id,
          type: 'filter',
          fn: data.filterType,
          params: { ...data.params } as Record<string, string | number | boolean>,
          inputs,
        });
        break;
      }

      case 'signal': {
        const data = node.data as SignalNodeData;
        // Find the source node feeding into this signal node
        const sources = incomingSources.get(node.id) ?? [];
        const sourceNodeId = sources.length > 0 ? sources[0] : '';

        const signalConfig: SignalConfig = {
          nodeId: node.id,
          direction: data.direction,
          sizing: data.sizing,
          sourceNodeId,
        };

        if (data.direction === 'buy') {
          entrySignals.push(signalConfig);
        } else {
          exitSignals.push(signalConfig);
        }
        break;
      }

      case 'output':
        // Already handled above
        break;
    }
  }

  // Validate that we have at least one data source
  if (dataSources.length === 0) {
    throw new CompilationError('No DataSource node found. Add at least one DataSource.');
  }

  // Validate that we have at least one entry signal
  if (entrySignals.length === 0) {
    throw new CompilationError('No entry (buy) Signal node found. Add a buy Signal node.');
  }

  return {
    dataSources,
    pipeline,
    entrySignals,
    exitSignals,
    outputConfig: {
      name: outputData.strategyName,
      initialCapital: outputData.initialCapital,
    },
  };
}

/**
 * Resolve the input connections for a given node.
 * Returns a mapping of targetHandle -> sourceNodeId.
 */
function resolveInputs(
  nodeId: string,
  incomingEdges: Map<string, Map<string, string>>
): Record<string, string> {
  const inputs: Record<string, string> = {};
  const edgeMap = incomingEdges.get(nodeId);
  if (edgeMap) {
    edgeMap.forEach((sourceId, handle) => {
      inputs[handle] = sourceId;
    });
  }
  return inputs;
}

/**
 * Build adjacency list from edges. Returns a map of nodeId -> list of successor nodeIds.
 */
function buildAdjacency(
  nodes: StrategyNode[],
  edges: StrategyEdge[]
): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    const list = adjacency.get(edge.source);
    if (list) {
      list.push(edge.target);
    }
  }
  return adjacency;
}

/**
 * Topological sort using Kahn's algorithm (BFS).
 * Detects cycles and throws CompilationError.
 */
function topologicalSort(
  nodes: StrategyNode[],
  adjacency: Map<string, string[]>
): string[] {
  // Compute in-degrees
  const inDegree = new Map<string, number>();
  for (const node of nodes) {
    inDegree.set(node.id, 0);
  }
  adjacency.forEach((neighbors) => {
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) + 1);
    }
  });

  // Prioritize by category for deterministic ordering
  const categoryOrder: Record<NodeCategory, number> = {
    datasource: 0,
    indicator: 1,
    condition: 2,
    combiner: 3,
    filter: 4,
    signal: 5,
    output: 6,
  };

  const nodeMap = new Map<string, StrategyNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Initialize queue with nodes that have no incoming edges
  const queue: string[] = [];
  for (const node of nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  }

  // Sort queue by category priority
  queue.sort((a, b) => {
    const nodeA = nodeMap.get(a);
    const nodeB = nodeMap.get(b);
    if (!nodeA || !nodeB) return 0;
    return categoryOrder[nodeA.data.category] - categoryOrder[nodeB.data.category];
  });

  const sorted: string[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
        // Re-sort to maintain category order
        queue.sort((a, b) => {
          const nA = nodeMap.get(a);
          const nB = nodeMap.get(b);
          if (!nA || !nB) return 0;
          return categoryOrder[nA.data.category] - categoryOrder[nB.data.category];
        });
      }
    }
  }

  if (sorted.length !== nodes.length) {
    // Find cycle participants
    const cycleNodes = nodes
      .filter((n) => !sorted.includes(n.id))
      .map((n) => n.id);
    throw new CompilationError(
      'Cycle detected in the graph. Remove circular connections.',
      cycleNodes
    );
  }

  return sorted;
}
