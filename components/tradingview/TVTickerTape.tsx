'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';

const TICKER_SYMBOLS = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'NASDAQ:QQQ', title: 'QQQ' },
  { proName: 'BINANCE:BTCUSDT', title: 'BTC' },
  { proName: 'BINANCE:ETHUSDT', title: 'ETH' },
  { proName: 'BINANCE:SOLUSDT', title: 'SOL' },
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'TVC:US10Y', title: 'US 10Y' },
] as const;

export const TVTickerTape = memo(function TVTickerTape({
  className = '',
}: {
  className?: string;
}) {
  const config = useMemo(
    () => ({
      symbols: TICKER_SYMBOLS.map((s) => ({
        proName: s.proName,
        title: s.title,
      })),
      showSymbolLogo: true,
      displayMode: 'adaptive',
    }),
    []
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
      config={config}
      className={className}
    />
  );
});
