import { create } from 'zustand';
import type { BacktestResult, ComparisonSlot } from '@/engine/types';
import { COMPARISON_COLORS } from '@/engine/types';

interface BacktestStore {
  isRunning: boolean;
  result: BacktestResult | null;
  error: string | null;

  comparisonSlots: ComparisonSlot[];
  activeComparisonIds: string[];

  setResult: (result: BacktestResult) => void;
  setError: (error: string | null) => void;
  setRunning: (running: boolean) => void;

  saveToComparison: (label?: string) => void;
  removeComparison: (id: string) => void;
  clearComparisons: () => void;
  toggleComparisonActive: (id: string) => void;
  renameComparison: (id: string, label: string) => void;
}

export const useBacktestStore = create<BacktestStore>((set, get) => ({
  isRunning: false,
  result: null,
  error: null,

  comparisonSlots: [],
  activeComparisonIds: [],

  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error }),
  setRunning: (isRunning) => set({ isRunning }),

  saveToComparison: (label?: string) => {
    const { result, comparisonSlots } = get();
    if (!result || comparisonSlots.length >= 4) return;

    const id = crypto.randomUUID();
    const color = COMPARISON_COLORS[comparisonSlots.length] ?? '#3B82F6';
    const slot: ComparisonSlot = {
      id,
      label: label ?? result.strategyName ?? `Strategy ${comparisonSlots.length + 1}`,
      result,
      strategySnapshot: { nodes: [], edges: [] },
      savedAt: Date.now(),
      color,
    };

    set((state) => ({
      comparisonSlots: [...state.comparisonSlots, slot],
      activeComparisonIds: [...state.activeComparisonIds, id],
    }));
  },

  removeComparison: (id) => {
    set((state) => {
      const newSlots = state.comparisonSlots.filter((s) => s.id !== id);
      // Re-assign colors based on new order
      const recolored = newSlots.map((s, i) => ({
        ...s,
        color: COMPARISON_COLORS[i] ?? '#3B82F6',
      }));
      return {
        comparisonSlots: recolored,
        activeComparisonIds: state.activeComparisonIds.filter((aid) => aid !== id),
      };
    });
  },

  clearComparisons: () => set({ comparisonSlots: [], activeComparisonIds: [] }),

  toggleComparisonActive: (id) => {
    set((state) => {
      const isActive = state.activeComparisonIds.includes(id);
      return {
        activeComparisonIds: isActive
          ? state.activeComparisonIds.filter((aid) => aid !== id)
          : [...state.activeComparisonIds, id],
      };
    });
  },

  renameComparison: (id, label) => {
    set((state) => ({
      comparisonSlots: state.comparisonSlots.map((s) =>
        s.id === id ? { ...s, label } : s
      ),
    }));
  },
}));
