'use client';

import { useState, lazy, Suspense } from 'react';
import { Layers } from 'lucide-react';
import { useBacktestStore } from '@/stores/backtestStore';
import LoadingPulse from '@/components/shared/LoadingPulse';

const ComparisonView = lazy(() => import('@/features/comparison/ComparisonView'));

interface TabConfig {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export default function ResultsPanel() {
  const result = useBacktestStore((s) => s.result);
  const comparisonSlots = useBacktestStore((s) => s.comparisonSlots);
  const saveToComparison = useBacktestStore((s) => s.saveToComparison);
  const [activeTab, setActiveTab] = useState('equity');

  const tabs: TabConfig[] = [
    { id: 'equity', label: 'Equity Curve' },
    { id: 'stats', label: 'Stats' },
    { id: 'trades', label: 'Trades' },
    { id: 'monthly', label: 'Monthly Returns' },
    { id: 'distribution', label: 'Distribution' },
    {
      id: 'compare',
      label: 'Compare',
      badge: comparisonSlots.length >= 2
        ? `${comparisonSlots.length} saved`
        : 'Save 2+ runs',
      disabled: comparisonSlots.length < 2,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111113] border-t border-zinc-800">
      {/* Header with tabs and save button */}
      <div className="flex items-center justify-between px-3 border-b border-zinc-800">
        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                px-3 py-2.5 text-xs font-medium transition-all duration-150
                border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-blue-500 text-zinc-200'
                  : tab.disabled
                    ? 'border-transparent text-zinc-600 cursor-not-allowed'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }
              `}
              title={
                tab.disabled && tab.id === 'compare'
                  ? 'Save at least one more result to enable comparison'
                  : undefined
              }
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    tab.disabled ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Save to Compare button */}
        <button
          onClick={() => saveToComparison()}
          disabled={!result || comparisonSlots.length >= 4}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={
            !result
              ? 'Run a backtest first'
              : comparisonSlots.length >= 4
                ? 'Remove a saved result to make room'
                : 'Save current result to compare'
          }
        >
          <Layers className="w-3.5 h-3.5" />
          Save to Compare
          {comparisonSlots.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-zinc-700 rounded text-[10px]">
              {comparisonSlots.length}/4
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'equity' && (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500">
            {result ? 'Equity Curve (main branch)' : 'Run a backtest to see results'}
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500">
            Stats (main branch)
          </div>
        )}
        {activeTab === 'trades' && (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500">
            Trades (main branch)
          </div>
        )}
        {activeTab === 'monthly' && (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500">
            Monthly Returns (main branch)
          </div>
        )}
        {activeTab === 'distribution' && (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500">
            Distribution (main branch)
          </div>
        )}
        {activeTab === 'compare' && (
          <Suspense fallback={<LoadingPulse />}>
            <ComparisonView />
          </Suspense>
        )}
      </div>
    </div>
  );
}
