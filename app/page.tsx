'use client';

import { useCallback, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MarketContextModal } from '@/components/layout/MarketContextModal';
import { NodePalette } from '@/components/panels/NodePalette';
import { NodeInspector } from '@/components/panels/NodeInspector';
import { ResultsPanel } from '@/components/panels/ResultsPanel';
import { StrategyCanvas } from '@/components/canvas/StrategyCanvas';
import { useBacktestRunner } from '@/hooks/useBacktest';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStrategyStore } from '@/stores/strategyStore';
import { Providers } from './providers';

function AppContent() {
  const { run } = useBacktestRunner();
  const { nodes, edges, strategyName, loadStrategy } = useStrategyStore();

  // Auto-save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (nodes.length > 0) {
        const strategies = JSON.parse(
          localStorage.getItem('signaflow:strategies') || '{}'
        );
        const id = 'default';
        strategies[id] = {
          name: strategyName,
          nodes,
          edges,
          lastModified: Date.now(),
        };
        localStorage.setItem('signaflow:strategies', JSON.stringify(strategies));
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [nodes, edges, strategyName]);

  // Load last strategy on mount
  useEffect(() => {
    try {
      const strategies = JSON.parse(
        localStorage.getItem('signaflow:strategies') || '{}'
      );
      const defaultStrategy = strategies['default'];
      if (defaultStrategy && defaultStrategy.nodes.length > 0) {
        loadStrategy(
          defaultStrategy.nodes,
          defaultStrategy.edges,
          defaultStrategy.name || 'Untitled Strategy'
        );
      }
    } catch {
      // Ignore parse errors
    }
  }, [loadStrategy]);

  const handleSave = useCallback(() => {
    const strategies = JSON.parse(
      localStorage.getItem('signaflow:strategies') || '{}'
    );
    strategies['default'] = {
      name: strategyName,
      nodes,
      edges,
      lastModified: Date.now(),
    };
    localStorage.setItem('signaflow:strategies', JSON.stringify(strategies));
  }, [nodes, edges, strategyName]);

  useKeyboardShortcuts({
    onRunBacktest: run,
    onSaveStrategy: handleSave,
  });

  return (
    <AppShell
      palette={<NodePalette />}
      canvas={<StrategyCanvas />}
      inspector={<NodeInspector />}
      results={<ResultsPanel />}
      modals={<MarketContextModal />}
    />
  );
}

export default function Home() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
