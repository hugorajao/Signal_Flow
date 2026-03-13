import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

interface StrategyStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  strategyName: string;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  removeNodes: (nodeIds: string[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setStrategyName: (name: string) => void;
  loadStrategy: (nodes: Node[], edges: Edge[], name: string) => void;
  clear: () => void;
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  strategyName: 'Untitled Strategy',

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge(connection, get().edges) }),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node,
      ),
    })),

  removeNodes: (nodeIds) => {
    const idSet = new Set(nodeIds);
    set((state) => ({
      nodes: state.nodes.filter((node) => !idSet.has(node.id)),
      edges: state.edges.filter(
        (edge) => !idSet.has(edge.source) && !idSet.has(edge.target),
      ),
      selectedNodeId:
        state.selectedNodeId && idSet.has(state.selectedNodeId)
          ? null
          : state.selectedNodeId,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setStrategyName: (name) => set({ strategyName: name }),

  loadStrategy: (nodes, edges, name) =>
    set({ nodes, edges, strategyName: name, selectedNodeId: null }),

  clear: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      strategyName: 'Untitled Strategy',
    }),
}));
