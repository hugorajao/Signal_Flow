'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';
import { toTradingViewSymbol, toTradingViewInterval } from '@/lib/tradingview';

interface TVAdvancedChartProps {
  symbol: string;
  interval?: string;
  studies?: string[];
  height?: number;
  className?: string;
}

export const TVAdvancedChart = memo(function TVAdvancedChart({
  symbol,
  interval = '1d',
  studies = [],
  height = 500,
  className = '',
}: TVAdvancedChartProps) {
  const config = useMemo(
    () => ({
      symbol: toTradingViewSymbol(symbol),
      interval: toTradingViewInterval(interval),
      width: '100%',
      height,
      style: '1',
      timezone: 'Etc/UTC',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      allow_symbol_change: false,
      studies,
    }),
    [symbol, interval, height, studies]
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      config={config}
      widgetKey={symbol}
      className={className}
    />
  );
});
