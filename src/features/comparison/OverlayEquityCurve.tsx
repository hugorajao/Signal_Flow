'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, LineSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { ComparisonData } from './hooks/useComparisonData';

interface OverlayEquityCurveProps {
  data: ComparisonData;
}

export default function OverlayEquityCurve({ data }: OverlayEquityCurveProps) {
  const { activeSlots, normalizedEquity } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [normalized, setNormalized] = useState(true);

  const getChartData = useCallback(
    (slotId: string) => {
      if (normalized) {
        return (normalizedEquity.get(slotId) ?? []).map((p) => ({
          time: (p.time / 1000) as unknown as import('lightweight-charts').UTCTimestamp,
          value: p.value,
        }));
      }
      const slot = activeSlots.find((s) => s.id === slotId);
      if (!slot) return [];
      return slot.result.equityCurve.map((p) => ({
        time: (p.time / 1000) as unknown as import('lightweight-charts').UTCTimestamp,
        value: p.equity,
      }));
    },
    [normalized, normalizedEquity, activeSlots]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRefs.current.clear();
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { color: 'transparent' },
        textColor: '#71717A',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E1E22' },
        horzLines: { color: '#1E1E22' },
      },
      crosshair: {
        vertLine: { color: '#3B82F640', width: 1, style: 2 },
        horzLine: { color: '#3B82F640', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#1E1E22',
      },
      timeScale: {
        borderColor: '#1E1E22',
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    // Add a line series per active slot
    for (const slot of activeSlots) {
      const series = chart.addSeries(LineSeries, {
        color: slot.color,
        lineWidth: 2,
        crosshairMarkerRadius: 4,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const chartData = getChartData(slot.id);
      if (chartData.length > 0) {
        series.setData(chartData);
      }
      seriesRefs.current.set(slot.id, series);
    }

    chart.timeScale().fitContent();

    // Custom crosshair tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return;

      if (!param.time || param.seriesData.size === 0) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      const lines: string[] = [];
      for (const slot of activeSlots) {
        const series = seriesRefs.current.get(slot.id);
        if (!series) continue;
        const data = param.seriesData.get(series);
        if (data && 'value' in data) {
          const val = normalized
            ? data.value.toFixed(1)
            : `$${data.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          lines.push(
            `<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${slot.color};"></span><span style="color:#a1a1aa;">${slot.label}:</span> <span style="color:#e4e4e7;font-family:'JetBrains Mono',monospace;">${val}</span></div>`
          );
        }
      }

      if (lines.length === 0) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      tooltipRef.current.innerHTML = lines.join('');
      tooltipRef.current.style.display = 'block';

      const point = param.point;
      if (point) {
        const containerWidth = containerRef.current?.clientWidth ?? 0;
        const tooltipWidth = 220;
        const left = point.x + tooltipWidth + 20 > containerWidth
          ? point.x - tooltipWidth - 10
          : point.x + 16;
        tooltipRef.current.style.left = `${left}px`;
        tooltipRef.current.style.top = `${point.y}px`;
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRefs.current.clear();
    };
  }, [activeSlots, normalized, getChartData]);

  if (activeSlots.length === 0) return null;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          Equity Curve
        </span>
        <button
          onClick={() => setNormalized(!normalized)}
          className={`px-2 py-1 text-[10px] font-medium rounded border transition-all duration-150
            ${normalized
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
              : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
        >
          {normalized ? 'Normalized (100)' : 'Absolute ($)'}
        </button>
      </div>
      <div className="relative">
        {/* Legend */}
        <div className="absolute top-2 left-3 z-10 flex flex-col gap-1">
          {activeSlots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-1.5 text-[10px]">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: slot.color,
                  boxShadow: `0 0 6px ${slot.color}66`,
                }}
              />
              <span style={{ color: slot.color }}>{slot.label}</span>
            </div>
          ))}
        </div>
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute z-20 px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900/95 text-xs"
          style={{ display: 'none', pointerEvents: 'none' }}
        />
        <div ref={containerRef} />
      </div>
    </div>
  );
}
