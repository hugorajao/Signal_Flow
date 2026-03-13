'use client';

import { BacktestMetrics } from '@/engine/types';
import {
  formatPercent,
  formatNumber,
  formatCurrency,
  formatRatio,
} from '@/lib/formatters';

interface StatsGridProps {
  metrics: BacktestMetrics;
}

type BadgeVariant = 'green' | 'red' | 'neutral';

interface MetricConfig {
  label: string;
  format: (value: number) => string;
  badge: (value: number) => BadgeVariant;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  neutral: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
};

function getBadgeLabel(variant: BadgeVariant): string {
  if (variant === 'green') return 'Good';
  if (variant === 'red') return 'Poor';
  return 'Neutral';
}

const METRICS_CONFIG: Record<keyof BacktestMetrics, MetricConfig> = {
  totalReturn: {
    label: 'Total Return',
    format: (v) => formatPercent(v),
    badge: (v) => (v > 0 ? 'green' : v < 0 ? 'red' : 'neutral'),
  },
  cagr: {
    label: 'CAGR',
    format: (v) => formatPercent(v),
    badge: (v) => (v > 0 ? 'green' : v < 0 ? 'red' : 'neutral'),
  },
  sharpe: {
    label: 'Sharpe Ratio',
    format: (v) => formatRatio(v),
    badge: (v) => (v > 1 ? 'green' : v < 0 ? 'red' : 'neutral'),
  },
  sortino: {
    label: 'Sortino Ratio',
    format: (v) => formatRatio(v),
    badge: (v) => (v > 1.5 ? 'green' : v < 0 ? 'red' : 'neutral'),
  },
  maxDrawdown: {
    label: 'Max Drawdown',
    format: (v) => formatPercent(v),
    badge: (v) => (Math.abs(v) < 10 ? 'green' : Math.abs(v) > 20 ? 'red' : 'neutral'),
  },
  maxDrawdownDuration: {
    label: 'Max DD Duration',
    format: (v) => `${formatNumber(v)} days`,
    badge: () => 'neutral',
  },
  winRate: {
    label: 'Win Rate',
    format: (v) => formatPercent(v),
    badge: (v) => (v > 50 ? 'green' : v < 40 ? 'red' : 'neutral'),
  },
  profitFactor: {
    label: 'Profit Factor',
    format: (v) => formatRatio(v),
    badge: (v) => (v > 1 ? 'green' : 'red'),
  },
  expectancy: {
    label: 'Expectancy',
    format: (v) => formatCurrency(v),
    badge: (v) => (v > 0 ? 'green' : 'red'),
  },
  calmar: {
    label: 'Calmar Ratio',
    format: (v) => formatRatio(v),
    badge: (v) => (v > 1 ? 'green' : v < 0.5 ? 'red' : 'neutral'),
  },
  totalTrades: {
    label: 'Total Trades',
    format: (v) => formatNumber(v),
    badge: () => 'neutral',
  },
  avgHoldingPeriod: {
    label: 'Avg Holding Period',
    format: (v) => `${formatNumber(v, 1)} days`,
    badge: () => 'neutral',
  },
  bestTrade: {
    label: 'Best Trade',
    format: (v) => formatPercent(v),
    badge: () => 'green',
  },
  worstTrade: {
    label: 'Worst Trade',
    format: (v) => formatPercent(v),
    badge: () => 'red',
  },
};

const METRIC_KEYS: (keyof BacktestMetrics)[] = [
  'totalReturn',
  'cagr',
  'sharpe',
  'sortino',
  'maxDrawdown',
  'maxDrawdownDuration',
  'winRate',
  'profitFactor',
  'expectancy',
  'calmar',
  'totalTrades',
  'avgHoldingPeriod',
  'bestTrade',
  'worstTrade',
];

export function StatsGrid({ metrics }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {METRIC_KEYS.map((key) => {
        const config = METRICS_CONFIG[key];
        const value = metrics[key];
        const variant = config.badge(value);

        return (
          <div
            key={key}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {config.label}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-zinc-100">
              {config.format(value)}
            </p>
            <span
              className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${BADGE_CLASSES[variant]}`}
            >
              {getBadgeLabel(variant)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
