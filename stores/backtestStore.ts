import { create } from 'zustand';
import type { BacktestResult, ComparisonSlot, StrategyNode, StrategyEdge } from '@/engine/types';
import type { Node, Edge } from '@xyflow/react';
import { COMPARISON_PALETTE } from '@/lib/colors';

const MAX_COMPARISON_SLOTS = 4;

function generateSlotId(): string {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function snapshotNodes(nodes: Node[]): StrategyNode[] {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type ?? 'default',
    position: { x: node.position.x, y: node.position.y },
    data: node.data as StrategyNode['data'],
  }));
}

function snapshotEdges(edges: Edge[]): StrategyEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  }));
}

interface BacktestStore {
  isRunning: boolean;
  result: BacktestResult | null;
  error: string | null;
  progress: number;

  comparisonSlots: ComparisonSlot[];
  activeComparisonIds: string[];

  setRunning: (running: boolean) => void;
  setResult: (result: BacktestResult | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  saveToComparison: (label?: string, strategyNodes?: Node[], strategyEdges?: Edge[]) => void;
  removeComparison: (id: string) => void;
  clearComparisons: () => void;
  toggleComparisonActive: (id: string) => void;
}

export const useBacktestStore = create<BacktestStore>((set, get) => ({
  isRunning: false,
  result: null,
  error: null,
  progress: 0,

  comparisonSlots: [],
  activeComparisonIds: [],

  setRunning: (running) =>
    set({ isRunning: running }),

  setResult: (result) =>
    set({ result, error: null }),

  setError: (error) =>
    set({ error, isRunning: false }),

  setProgress: (progress) =>
    set({ progress }),

  saveToComparison: (label, strategyNodes, strategyEdges) => {
    const state = get();
    const { result, comparisonSlots } = state;

    if (!result) return;
    if (comparisonSlots.length >= MAX_COMPARISON_SLOTS) return;

    const colorIndex = comparisonSlots.length % COMPARISON_PALETTE.length;
    const id = generateSlotId();

    const slot: ComparisonSlot = {
      id,
      label: label ?? result.strategyName,
      result: structuredClone(result),
      strategySnapshot: {
        nodes: strategyNodes ? snapshotNodes(strategyNodes) : [],
        edges: strategyEdges ? snapshotEdges(strategyEdges) : [],
      },
      savedAt: Date.now(),
      color: COMPARISON_PALETTE[colorIndex],
    };

    set({
      comparisonSlots: [...comparisonSlots, slot],
      activeComparisonIds: [...state.activeComparisonIds, id],
    });
  },

  removeComparison: (id) =>
    set((state) => ({
      comparisonSlots: state.comparisonSlots.filter((s) => s.id !== id),
      activeComparisonIds: state.activeComparisonIds.filter((aid) => aid !== id),
    })),

  clearComparisons: () =>
    set({ comparisonSlots: [], activeComparisonIds: [] }),

  toggleComparisonActive: (id) =>
    set((state) => {
      const isActive = state.activeComparisonIds.includes(id);
      return {
        activeComparisonIds: isActive
          ? state.activeComparisonIds.filter((aid) => aid !== id)
          : [...state.activeComparisonIds, id],
      };
    }),
}));
