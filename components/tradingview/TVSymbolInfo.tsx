'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';
import { toTradingViewSymbol } from '@/lib/tradingview';

interface TVSymbolInfoProps {
  symbol: string;
  className?: string;
}

export const TVSymbolInfo = memo(function TVSymbolInfo({
  symbol,
  className = '',
}: TVSymbolInfoProps) {
  const config = useMemo(
    () => ({
      symbol: toTradingViewSymbol(symbol),
      width: '100%',
      isTransparent: true,
    }),
    [symbol]
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
      config={config}
      widgetKey={symbol}
      className={className}
    />
  );
});
