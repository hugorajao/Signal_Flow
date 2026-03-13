'use client';

import { useEffect, useRef, memo } from 'react';

const TV_STUDY_MAP: Record<string, string> = {
  SMA: 'STD;SMA',
  EMA: 'STD;EMA',
  RSI: 'STD;RSI',
  MACD: 'STD;MACD',
  BB: 'STD;Bollinger_Bands',
  ATR: 'STD;ATR',
  VWAP: 'STD;VWAP',
};

interface PriceChartProps {
  symbol: string;
  studies: string[];
}

function PriceChartInner({ symbol, studies }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const mappedStudies = studies
      .map((s) => TV_STUDY_MAP[s])
      .filter((s): s is string => s !== undefined);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      gridColor: 'rgba(30, 30, 34, 1)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      studies: mappedStudies,
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetInner = document.createElement('div');
    widgetInner.className = 'tradingview-widget-container__widget';
    widgetInner.style.height = '100%';
    widgetInner.style.width = '100%';

    widgetContainer.appendChild(widgetInner);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, studies]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: 400 }}
    />
  );
}

export const PriceChart = memo(PriceChartInner);
