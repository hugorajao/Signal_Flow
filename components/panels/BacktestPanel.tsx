'use client';

import { Play, Square } from 'lucide-react';
import { useBacktestStore } from '@/stores/backtestStore';

interface BacktestPanelProps {
  onRunBacktest: () => void;
}

export function BacktestPanel({ onRunBacktest }: BacktestPanelProps) {
  const { isRunning, progress, error } = useBacktestStore();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
      <button
        onClick={onRunBacktest}
        disabled={isRunning}
        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-sans font-medium rounded-lg transition-all ${
          isRunning
            ? 'bg-red-600/20 text-red-400 cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700'
        }`}
        aria-label={isRunning ? 'Backtest running' : 'Run backtest'}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5" fill="currentColor" />
            Running...
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            Run Backtest
          </>
        )}
      </button>

      {isRunning && (
        <div className="flex-1 max-w-xs">
          <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 pulse-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs font-mono text-red-400">{error}</span>
      )}
    </div>
  );
}
