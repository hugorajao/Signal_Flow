'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Trade } from '@/engine/types';
import { CHART_COLORS } from '@/lib/colors';

interface DistributionChartProps {
  trades: Trade[];
}

interface Bin {
  label: string;
  count: number;
  rangeStart: number;
}

interface TooltipPayloadEntry {
  payload: Bin;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function DistributionTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const bin = payload[0].payload;
  return (
    <div className="rounded border border-zinc-700 bg-zinc-900 p-2 text-xs">
      <p className="text-zinc-400">{bin.label}</p>
      <p className="font-mono text-zinc-200">{bin.count} trades</p>
    </div>
  );
}

function createBins(trades: Trade[], binCount: number): Bin[] {
  if (trades.length === 0) return [];

  const returns = trades.map((t) => t.pnlPercent);
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);

  // Ensure we have some range
  const range = maxReturn - minReturn || 1;
  const binWidth = range / binCount;

  const bins: Bin[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = minReturn + i * binWidth;
    const end = start + binWidth;
    bins.push({
      label: `${start.toFixed(1)}% to ${end.toFixed(1)}%`,
      count: 0,
      rangeStart: start + binWidth / 2,
    });
  }

  for (const ret of returns) {
    let idx = Math.floor((ret - minReturn) / binWidth);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }

  return bins;
}

export function DistributionChart({ trades }: DistributionChartProps) {
  const bins = useMemo(() => createBins(trades, 20), [trades]);

  if (bins.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-zinc-500">
        No trade data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={bins} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.grid}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="#52525B"
          tick={{ fontSize: 9, fill: '#71717A' }}
          axisLine={{ stroke: '#27272A' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#52525B"
          tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={{ stroke: '#27272A' }}
          tickLine={false}
          allowDecimals={false}
          width={36}
        />
        <Tooltip content={<DistributionTooltip />} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {bins.map((bin, idx) => (
            <Cell
              key={idx}
              fill={
                bin.rangeStart >= 0
                  ? CHART_COLORS.positive
                  : CHART_COLORS.negative
              }
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
