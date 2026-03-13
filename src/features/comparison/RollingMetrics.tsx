'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ComparisonData } from './hooks/useComparisonData';
import { formatShortDate } from '@/lib/formatters';

interface RollingMetricsProps {
  data: ComparisonData;
}

type RollingMetricType = 'sharpe' | 'return' | 'volatility';

const METRIC_LABELS: Record<RollingMetricType, string> = {
  sharpe: 'Rolling Sharpe',
  return: 'Rolling Return',
  volatility: 'Rolling Volatility',
};

const METRIC_FORMAT: Record<RollingMetricType, (v: number) => string> = {
  sharpe: (v) => v.toFixed(2),
  return: (v) => `${v.toFixed(1)}%`,
  volatility: (v) => `${v.toFixed(1)}%`,
};

export default function RollingMetrics({ data }: RollingMetricsProps) {
  const { activeSlots, rollingSharpe, rollingReturn, rollingVolatility } = data;
  const [metricType, setMetricType] = useState<RollingMetricType>('sharpe');

  if (activeSlots.length === 0) return null;

  const dataSource =
    metricType === 'sharpe'
      ? rollingSharpe
      : metricType === 'return'
        ? rollingReturn
        : rollingVolatility;

  // Merge time series into chart data
  const timeMap = new Map<number, Record<string, number>>();
  for (const slot of activeSlots) {
    const series = dataSource.get(slot.id) ?? [];
    for (const point of series) {
      const existing = timeMap.get(point.time) ?? {};
      existing[slot.id] = point.value;
      timeMap.set(point.time, existing);
    }
  }

  const chartData = Array.from(timeMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, values]) => ({ time, ...values }));

  const metricTypes: RollingMetricType[] = ['sharpe', 'return', 'volatility'];

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          {METRIC_LABELS[metricType]}
        </span>
        <div className="flex gap-1">
          {metricTypes.map((mt) => (
            <button
              key={mt}
              onClick={() => setMetricType(mt)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all duration-150
                ${metricType === mt
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {mt === 'sharpe' ? 'Sharpe' : mt === 'return' ? 'Return' : 'Vol'}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" />
            <XAxis
              dataKey="time"
              tickFormatter={(t: number) => formatShortDate(t)}
              tick={{ fontSize: 10, fill: '#71717A' }}
              stroke="#1E1E22"
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => METRIC_FORMAT[metricType](v)}
              tick={{ fontSize: 10, fill: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}
              stroke="#1E1E22"
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181B',
                border: '1px solid #27272A',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              labelFormatter={(t) => formatShortDate(Number(t))}
              formatter={(value, name) => {
                const slot = activeSlots.find((s) => s.id === String(name));
                return [METRIC_FORMAT[metricType](Number(value)), slot?.label ?? String(name)];
              }}
            />
            {activeSlots.map((slot) => (
              <Line
                key={slot.id}
                type="monotone"
                dataKey={slot.id}
                stroke={slot.color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
