'use client';

import { useState, useMemo } from 'react';
import type { ComparisonData } from './hooks/useComparisonData';
import type { Trade } from '@/engine/types';
import { formatDate, formatPercent, formatCurrency } from '@/lib/formatters';

interface TradeOverlapTimelineProps {
  data: ComparisonData;
}

interface TooltipData {
  trade: Trade;
  slotLabel: string;
  slotColor: string;
  x: number;
  y: number;
}

export default function TradeOverlapTimeline({ data }: TradeOverlapTimelineProps) {
  const { activeSlots, tradeTimelines, timeRange } = data;
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const totalDuration = timeRange.end - timeRange.start;

  const rows = useMemo(() => {
    if (totalDuration <= 0) return [];

    return activeSlots.map((slot) => {
      const timeline = tradeTimelines.get(slot.id) ?? [];
      const blocks = timeline
        .filter((t) => t.end >= timeRange.start && t.start <= timeRange.end)
        .map((entry) => {
          const start = Math.max(entry.start, timeRange.start);
          const end = Math.min(entry.end, timeRange.end);
          const leftPct = ((start - timeRange.start) / totalDuration) * 100;
          const widthPct = ((end - start) / totalDuration) * 100;
          return {
            leftPct,
            widthPct: Math.max(widthPct, 0.3), // minimum visible width
            trade: entry.trade,
          };
        });
      return { slot, blocks };
    });
  }, [activeSlots, tradeTimelines, timeRange, totalDuration]);

  if (activeSlots.length === 0 || totalDuration <= 0) return null;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          Trade Timeline
        </span>
      </div>
      <div className="relative p-3" style={{ minHeight: 180 }}>
        {rows.map(({ slot, blocks }) => (
          <div key={slot.id} className="flex items-center gap-2 mb-2 last:mb-0">
            <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: slot.color,
                  boxShadow: `0 0 6px ${slot.color}66`,
                }}
              />
              <span className="text-[10px] text-zinc-400 truncate">{slot.label}</span>
            </div>
            <div className="relative flex-1 h-6 bg-zinc-900 rounded-sm overflow-hidden">
              {blocks.map((block, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full rounded-sm cursor-pointer transition-opacity duration-150 hover:opacity-80"
                  style={{
                    left: `${block.leftPct}%`,
                    width: `${block.widthPct}%`,
                    backgroundColor: `${slot.color}99`,
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const parentRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                    if (parentRect) {
                      setTooltip({
                        trade: block.trade,
                        slotLabel: slot.label,
                        slotColor: slot.color,
                        x: rect.left - parentRect.left + rect.width / 2,
                        y: rect.top - parentRect.top - 8,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-30 px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900/95 text-[10px] whitespace-nowrap pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium text-zinc-200 mb-1">{tooltip.slotLabel}: {tooltip.trade.symbol}</div>
            <div className="text-zinc-400">
              {formatDate(tooltip.trade.entryTime)} → {formatDate(tooltip.trade.exitTime)}
            </div>
            <div className={tooltip.trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              PnL: {formatCurrency(tooltip.trade.pnl)} ({formatPercent(tooltip.trade.pnlPercent)})
            </div>
          </div>
        )}

        {/* Time axis labels */}
        <div className="flex justify-between mt-2 px-24">
          <span className="text-[9px] text-zinc-600 font-mono">
            {formatDate(timeRange.start)}
          </span>
          <span className="text-[9px] text-zinc-600 font-mono">
            {formatDate(timeRange.end)}
          </span>
        </div>
      </div>
    </div>
  );
}
