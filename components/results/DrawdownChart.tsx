'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatPercent, formatDate } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/colors';

interface DrawdownPoint {
  time: number;
  drawdown: number;
}

interface DrawdownChartProps {
  drawdownCurve: DrawdownPoint[];
}

interface TooltipPayloadEntry {
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: number;
}

function DrawdownTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || label === undefined) {
    return null;
  }

  return (
    <div className="rounded border border-zinc-700 bg-zinc-900 p-2 text-xs">
      <p className="text-zinc-400">{formatDate(label)}</p>
      <p className="font-mono text-red-400">
        {formatPercent(payload[0].value)}
      </p>
    </div>
  );
}

export function DrawdownChart({ drawdownCurve }: DrawdownChartProps) {
  const data = drawdownCurve.map((p) => ({
    time: p.time,
    drawdown: p.drawdown,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.grid}
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tickFormatter={(val: number) => formatDate(val)}
          stroke="#52525B"
          tick={{ fontSize: 10, fill: '#71717A' }}
          axisLine={{ stroke: '#27272A' }}
          tickLine={false}
          minTickGap={60}
        />
        <YAxis
          tickFormatter={(val: number) => formatPercent(val, 1)}
          stroke="#52525B"
          tick={{ fontSize: 10, fill: '#71717A', fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={{ stroke: '#27272A' }}
          tickLine={false}
          domain={['dataMin', 0]}
          width={60}
        />
        <Tooltip content={<DrawdownTooltip />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#EF4444"
          fill={CHART_COLORS.drawdown}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
