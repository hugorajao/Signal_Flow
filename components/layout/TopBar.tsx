'use client';

import { Activity, BarChart3, Play, Save, ChevronDown } from 'lucide-react';
import { Kbd } from '@/components/shared/Kbd';
import { useUIStore } from '@/stores/uiStore';
import { useStrategyStore } from '@/stores/strategyStore';
import { useBacktestStore } from '@/stores/backtestStore';
import dynamic from 'next/dynamic';

const TVTickerTape = dynamic(
  () => import('@/components/tradingview/TVTickerTape').then(m => ({ default: m.TVTickerTape })),
  { ssr: false, loading: () => <div className="h-[46px] bg-[var(--bg-surface)]" /> }
);

export function TopBar() {
  const { setMarketsModalOpen } = useUIStore();
  const { strategyName } = useStrategyStore();
  const { isRunning } = useBacktestStore();

  return (
    <div className="flex flex-col border-b border-[var(--border-subtle)]">
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[var(--bg-surface)]">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="font-display text-base font-bold tracking-tight text-[var(--text-primary)]">
              SignaFlow
            </span>
          </div>
          <div className="w-px h-5 bg-[var(--border-default)]" />
          <button
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Strategy name"
          >
            <span className="font-sans">{strategyName || 'Untitled Strategy'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarketsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            aria-label="Open markets overview"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Markets</span>
            <Kbd>M</Kbd>
          </button>

          <button
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            aria-label="Save strategy"
          >
            <Save className="w-3.5 h-3.5" />
            <Kbd>⌘S</Kbd>
          </button>

          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg transition-all ${
              isRunning
                ? 'bg-blue-500/20 text-blue-400 cursor-wait pulse-glow'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
            aria-label="Run backtest"
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
            <Kbd>⌘R</Kbd>
          </button>
        </div>
      </div>

      {/* Ticker Tape */}
      <div className="h-[46px] bg-[var(--bg-root)] border-t border-[var(--border-subtle)]">
        <TVTickerTape />
      </div>
    </div>
  );
}
