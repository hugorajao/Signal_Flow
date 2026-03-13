'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';
import { toTradingViewSymbol } from '@/lib/tradingview';

interface TVMiniChartProps {
  symbol: string;
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL';
  className?: string;
}

export const TVMiniChart = memo(function TVMiniChart({
  symbol,
  dateRange = '12M',
  className = '',
}: TVMiniChartProps) {
  const config = useMemo(
    () => ({
      symbol: toTradingViewSymbol(symbol),
      width: '100%',
      height: '100%',
      dateRange,
      chartOnly: true,
      noTimeScale: false,
    }),
    [symbol, dateRange]
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
      config={config}
      widgetKey={symbol}
      className={className}
    />
  );
});
