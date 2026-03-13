'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';
import { toTradingViewSymbol, toTradingViewInterval } from '@/lib/tradingview';

interface TVTechnicalAnalysisProps {
  symbol: string;
  interval?: string;
  className?: string;
}

export const TVTechnicalAnalysis = memo(function TVTechnicalAnalysis({
  symbol,
  interval = '1d',
  className = '',
}: TVTechnicalAnalysisProps) {
  const config = useMemo(
    () => ({
      symbol: toTradingViewSymbol(symbol),
      interval: toTradingViewInterval(interval),
      width: '100%',
      height: '100%',
      showIntervalTabs: true,
    }),
    [symbol, interval]
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
      config={config}
      widgetKey={symbol}
      className={className}
    />
  );
});
