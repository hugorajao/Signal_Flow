'use client';

import { useState, Suspense, lazy } from 'react';
import { Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useBacktestStore } from '@/stores/backtestStore';
import { useUIStore } from '@/stores/uiStore';
import { LoadingPulse } from '@/components/shared/LoadingPulse';
import { Badge } from '@/components/shared/Badge';
import dynamic from 'next/dynamic';

const EquityCurve = dynamic(
  () => import('@/components/results/EquityCurve').then((m) => ({ default: m.EquityCurve })),
  { ssr: false, loading: () => <LoadingPulse className="h-[300px]" /> }
);

const PriceChart = dynamic(
  () => import('@/components/results/PriceChart').then((m) => ({ default: m.PriceChart })),
  { ssr: false, loading: () => <LoadingPulse className="h-[300px]" /> }
);

const StatsGrid = dynamic(
  () => import('@/components/results/StatsGrid').then((m) => ({ default: m.StatsGrid })),
  { ssr: false, loading: () => <LoadingPulse className="h-[200px]" /> }
);

const TradeList = dynamic(
  () => import('@/components/results/TradeList').then((m) => ({ default: m.TradeList })),
  { ssr: false, loading: () => <LoadingPulse className="h-[200px]" /> }
);

const MonthlyReturns = dynamic(
  () => import('@/components/results/MonthlyReturns').then((m) => ({ default: m.MonthlyReturns })),
  { ssr: false, loading: () => <LoadingPulse className="h-[200px]" /> }
);

const DistributionChart = dynamic(
  () => import('@/components/results/DistributionChart').then((m) => ({ default: m.DistributionChart })),
  { ssr: false, loading: () => <LoadingPulse className="h-[200px]" /> }
);

const DrawdownChart = dynamic(
  () => import('@/components/results/DrawdownChart').then((m) => ({ default: m.DrawdownChart })),
  { ssr: false, loading: () => <LoadingPulse className="h-[200px]" /> }
);

interface Tab {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}

export function ResultsPanel() {
  const { result, comparisonSlots, saveToComparison } = useBacktestStore();
  const { bottomPanelOpen, toggleBottomPanel, activeResultsTab, setActiveResultsTab } = useUIStore();
  const [activeTab, setActiveTab] = useState(activeResultsTab || 'equity');

  const tabs: Tab[] = [
    { id: 'price', label: 'Price Chart' },
    { id: 'equity', label: 'Equity Curve' },
    { id: 'stats', label: 'Stats' },
    { id: 'drawdown', label: 'Drawdown' },
    { id: 'trades', label: 'Trades' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'distribution', label: 'Distribution' },
    {
      id: 'compare',
      label: 'Compare',
      badge: comparisonSlots.length < 2 ? 'Save 2+ runs' : `${comparisonSlots.length} saved`,
      disabled: comparisonSlots.length < 2,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveResultsTab(tabId);
  };

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-[var(--text-tertiary)]">
          Run a backtest to see results
        </p>
      </div>
    );
  }

  // Extract primary symbol from strategy name or use default
  const primarySymbol = 'EQUITY:SPY';

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-sans whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-[var(--text-primary)]'
                  : tab.disabled
                  ? 'border-transparent text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <Badge variant={tab.disabled ? 'neutral' : 'info'}>
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          {result && (
            <button
              onClick={() => saveToComparison()}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
              aria-label="Save to comparison"
            >
              <Save className="w-3 h-3" />
              Save to Compare
            </button>
          )}
          <button
            onClick={toggleBottomPanel}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label={bottomPanelOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {bottomPanelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'price' && (
          <PriceChart symbol={primarySymbol} studies={[]} />
        )}
        {activeTab === 'equity' && (
          <EquityCurve result={result} />
        )}
        {activeTab === 'stats' && (
          <StatsGrid metrics={result.metrics} />
        )}
        {activeTab === 'drawdown' && (
          <DrawdownChart drawdownCurve={result.drawdownCurve} />
        )}
        {activeTab === 'trades' && (
          <TradeList trades={result.trades} />
        )}
        {activeTab === 'monthly' && (
          <MonthlyReturns monthlyReturns={result.monthlyReturns} />
        )}
        {activeTab === 'distribution' && (
          <DistributionChart trades={result.trades} />
        )}
        {activeTab === 'compare' && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[var(--text-tertiary)]">
              Run and save multiple strategies to compare them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
