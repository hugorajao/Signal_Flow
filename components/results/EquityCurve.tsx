'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
  LineSeries,
  createSeriesMarkers,
  UTCTimestamp,
  IChartApi,
  SeriesMarker,
  Time,
} from 'lightweight-charts';
import { BacktestResult } from '@/engine/types';

interface EquityCurveProps {
  result: BacktestResult;
}

export function EquityCurve({ result }: EquityCurveProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#A1A1AA',
      },
      grid: {
        vertLines: { color: '#1E1E22' },
        horzLines: { color: '#1E1E22' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#27272A' },
      timeScale: { borderColor: '#27272A', timeVisible: false },
    });

    // Equity line series
    const equitySeries = chart.addSeries(LineSeries, {
      color: '#3B82F6',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => '$' + price.toFixed(0),
      },
      lastValueVisible: true,
      priceLineVisible: false,
    });

    const equityData = result.equityCurve.map((p) => ({
      time: (p.time / 1000) as UTCTimestamp,
      value: p.equity,
    }));
    equitySeries.setData(equityData);

    // Benchmark overlay if available
    if (result.benchmarkEquity && result.benchmarkEquity.length > 0) {
      const benchSeries = chart.addSeries(LineSeries, {
        color: '#52525B',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      benchSeries.setData(
        result.benchmarkEquity.map((p) => ({
          time: (p.time / 1000) as UTCTimestamp,
          value: p.equity,
        }))
      );
    }

    // Trade markers: green arrows for entries, red for exits
    const markers: SeriesMarker<Time>[] = result.trades
      .flatMap((trade) => [
        {
          time: (trade.entryTime / 1000) as UTCTimestamp,
          position: 'belowBar' as const,
          color: '#22C55E',
          shape: 'arrowUp' as const,
          text: 'Buy',
        },
        {
          time: (trade.exitTime / 1000) as UTCTimestamp,
          position: 'aboveBar' as const,
          color: '#EF4444',
          shape: 'arrowDown' as const,
          text: 'Sell',
        },
      ])
      .sort((a, b) => (a.time as number) - (b.time as number));

    createSeriesMarkers(equitySeries, markers);

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [result]);

  return <div ref={chartContainerRef} className="w-full" />;
}
