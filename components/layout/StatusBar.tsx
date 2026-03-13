'use client';

import { useStrategyStore } from '@/stores/strategyStore';
import { useBacktestStore } from '@/stores/backtestStore';

export function StatusBar() {
  const { nodes, edges } = useStrategyStore();
  const { result, isRunning } = useBacktestStore();

  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  return (
    <div className="flex items-center justify-between px-4 h-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-tertiary)]">
      <div className="flex items-center gap-3">
        <span>{nodeCount} nodes · {edgeCount} edges</span>
        {isRunning && (
          <span className="text-blue-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Running backtest...
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {result && (
          <span>
            Last run: {result.metrics.totalTrades} trades · {result.metrics.totalReturn >= 0 ? '+' : ''}{result.metrics.totalReturn.toFixed(2)}%
          </span>
        )}
        <span>Daily</span>
      </div>
    </div>
  );
}
