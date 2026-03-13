'use client';

import { useState } from 'react';
import type { ComparisonData } from './hooks/useComparisonData';
import type { BacktestMetrics } from '@/engine/types';
import { formatPercent, formatNumber, formatCurrency } from '@/lib/formatters';

interface MetricsDeltaTableProps {
  data: ComparisonData;
}

interface MetricConfig {
  key: keyof BacktestMetrics;
  label: string;
  format: (v: number) => string;
}

const METRICS: MetricConfig[] = [
  { key: 'totalReturn', label: 'Total Return', format: (v) => formatPercent(v) },
  { key: 'cagr', label: 'CAGR', format: (v) => formatPercent(v) },
  { key: 'sharpe', label: 'Sharpe Ratio', format: (v) => formatNumber(v) },
  { key: 'sortino', label: 'Sortino Ratio', format: (v) => formatNumber(v) },
  { key: 'maxDrawdown', label: 'Max Drawdown', format: (v) => formatPercent(v) },
  { key: 'winRate', label: 'Win Rate', format: (v) => formatPercent(v) },
  { key: 'profitFactor', label: 'Profit Factor', format: (v) => formatNumber(v) },
  { key: 'totalTrades', label: 'Total Trades', format: (v) => v.toString() },
  { key: 'avgHoldingPeriod', label: 'Avg Hold (bars)', format: (v) => v.toFixed(0) },
  { key: 'bestTrade', label: 'Best Trade', format: (v) => formatPercent(v) },
  { key: 'worstTrade', label: 'Worst Trade', format: (v) => formatPercent(v) },
  { key: 'calmar', label: 'Calmar', format: (v) => formatNumber(v) },
  { key: 'expectancy', label: 'Expectancy', format: (v) => formatCurrency(v) },
];

export default function MetricsDeltaTable({ data }: MetricsDeltaTableProps) {
  const { activeSlots, metricWinners } = data;
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);

  if (activeSlots.length === 0) return null;

  const getSlotAbbrev = (slotId: string): string => {
    const slot = activeSlots.find((s) => s.id === slotId);
    if (!slot) return '—';
    return slot.label.length > 6 ? slot.label.slice(0, 6) : slot.label;
  };

  const getSlotColor = (slotId: string): string => {
    const slot = activeSlots.find((s) => s.id === slotId);
    return slot?.color ?? '#3B82F6';
  };

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          Metrics Comparison
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-zinc-500 font-medium">
                Metric
              </th>
              {activeSlots.map((slot) => (
                <th
                  key={slot.id}
                  className={`text-right px-3 py-2 text-xs uppercase tracking-wide font-medium cursor-pointer
                    hover:text-zinc-300 transition-colors
                    ${sortedColumn === slot.id ? 'text-zinc-200' : 'text-zinc-500'}`}
                  onClick={() => setSortedColumn(sortedColumn === slot.id ? null : slot.id)}
                >
                  <span className="flex items-center justify-end gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: slot.color }}
                    />
                    {getSlotAbbrev(slot.id)}
                  </span>
                </th>
              ))}
              <th className="text-right px-3 py-2 text-xs uppercase tracking-wide text-zinc-500 font-medium">
                Best
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, rowIdx) => {
              const winner = metricWinners.get(metric.key);
              const winnerId = winner?.winnerId ?? null;
              const winnerColor = winnerId ? getSlotColor(winnerId) : undefined;

              return (
                <tr
                  key={metric.key}
                  className={`
                    border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors
                    ${rowIdx % 2 === 1 ? 'bg-white/[0.02]' : ''}
                  `}
                >
                  <td className="px-3 py-2 text-xs text-zinc-400">{metric.label}</td>
                  {activeSlots.map((slot) => {
                    const value = slot.result.metrics[metric.key];
                    const isWinner = winnerId === slot.id;

                    return (
                      <td
                        key={slot.id}
                        className="text-right px-3 py-2 font-mono text-sm text-zinc-200"
                        style={
                          isWinner && winnerColor
                            ? {
                                borderLeft: `2px solid ${winnerColor}`,
                                backgroundColor: `${winnerColor}10`,
                              }
                            : undefined
                        }
                      >
                        {metric.format(value)}
                      </td>
                    );
                  })}
                  <td className="text-right px-3 py-2 text-xs text-zinc-400">
                    {winnerId ? (
                      <span className="flex items-center justify-end gap-1">
                        {getSlotAbbrev(winnerId)}
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getSlotColor(winnerId) }}
                        />
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
