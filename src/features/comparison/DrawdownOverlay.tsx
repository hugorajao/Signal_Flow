'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ComparisonData } from './hooks/useComparisonData';
import { formatShortDate } from '@/lib/formatters';

interface DrawdownOverlayProps {
  data: ComparisonData;
}

export default function DrawdownOverlay({ data }: DrawdownOverlayProps) {
  const { activeSlots, timeRange } = data;

  if (activeSlots.length === 0) return null;

  // Build merged data points keyed by time
  const timeMap = new Map<number, Record<string, number>>();

  for (const slot of activeSlots) {
    for (const point of slot.result.drawdownCurve) {
      if (point.time >= timeRange.start && point.time <= timeRange.end) {
        const existing = timeMap.get(point.time) ?? {};
        existing[slot.id] = point.drawdown;
        timeMap.set(point.time, existing);
      }
    }
  }

  const chartData = Array.from(timeMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, values]) => ({ time, ...values }));

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          Drawdown
        </span>
      </div>
      <div className="p-2" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" />
            <XAxis
              dataKey="time"
              tickFormatter={(t: number) => formatShortDate(t)}
              tick={{ fontSize: 10, fill: '#71717A' }}
              stroke="#1E1E22"
              tickLine={false}
            />
            <YAxis
              reversed
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
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
                return [`${Number(value).toFixed(2)}%`, slot?.label ?? String(name)];
              }}
            />
            {activeSlots.map((slot) => (
              <Area
                key={slot.id}
                type="monotone"
                dataKey={slot.id}
                stroke={slot.color}
                fill={slot.color}
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
