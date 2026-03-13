'use client';

import { useCallback } from 'react';
import { useStrategyStore } from '@/stores/strategyStore';
import { useBacktestStore } from '@/stores/backtestStore';
import { useUIStore } from '@/stores/uiStore';
import { compileStrategy, CompilationError } from '@/engine/compiler';
import { runBacktest } from '@/engine/backtester';
import { fetchPrices } from '@/lib/api';
import { StrategyNode, StrategyEdge, Candle } from '@/engine/types';

export function useBacktestRunner() {
  const { nodes, edges } = useStrategyStore();
  const { setRunning, setResult, setError, setProgress } = useBacktestStore();
  const { toggleBottomPanel, bottomPanelOpen, setActiveResultsTab } = useUIStore();

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Step 1: Compile strategy
      setProgress(10);
      const strategyNodes = nodes as unknown as StrategyNode[];
      const strategyEdges = edges as unknown as StrategyEdge[];
      const compiled = compileStrategy(strategyNodes, strategyEdges);

      // Step 2: Fetch data for all data sources
      setProgress(20);
      const dataMap = new Map<string, Candle[]>();

      for (let i = 0; i < compiled.dataSources.length; i++) {
        const ds = compiled.dataSources[i];
        setProgress(20 + ((i + 1) / compiled.dataSources.length) * 40);

        const candles = await fetchPrices(
          ds.symbol,
          ds.timeframe,
          ds.from,
          ds.to
        );

        if (candles.length === 0) {
          throw new Error(`No data returned for ${ds.symbol}`);
        }

        dataMap.set(ds.nodeId, candles);
      }

      // Step 3: Run backtest
      setProgress(70);
      const result = runBacktest(compiled, dataMap);
      setProgress(90);

      // Step 4: Store result
      setResult(result);
      setProgress(100);

      // Open results panel
      if (!bottomPanelOpen) {
        toggleBottomPanel();
      }
      setActiveResultsTab('equity');
    } catch (err) {
      if (err instanceof CompilationError) {
        setError(`Compilation error: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setRunning(false);
    }
  }, [nodes, edges, setRunning, setResult, setError, setProgress, toggleBottomPanel, bottomPanelOpen, setActiveResultsTab]);

  return { run };
}
