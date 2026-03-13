'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';

const MARKET_OVERVIEW_TABS = [
  {
    title: 'Indices',
    symbols: [
      { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
      { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' },
      { s: 'FOREXCOM:DJI', d: 'Dow 30' },
      { s: 'INDEX:NKX', d: 'Nikkei 225' },
      { s: 'INDEX:DEU40', d: 'DAX Index' },
      { s: 'FOREXCOM:UKXGBP', d: 'FTSE 100' },
    ],
    originalTitle: 'Indices',
  },
  {
    title: 'Crypto',
    symbols: [
      { s: 'BINANCE:BTCUSDT', d: 'Bitcoin' },
      { s: 'BINANCE:ETHUSDT', d: 'Ethereum' },
      { s: 'BINANCE:SOLUSDT', d: 'Solana' },
      { s: 'BINANCE:BNBUSDT', d: 'BNB' },
      { s: 'BINANCE:XRPUSDT', d: 'XRP' },
      { s: 'BINANCE:ADAUSDT', d: 'Cardano' },
    ],
    originalTitle: 'Crypto',
  },
] as const;

export const TVMarketOverview = memo(function TVMarketOverview({
  className = '',
}: {
  className?: string;
}) {
  const config = useMemo(
    () => ({
      tabs: MARKET_OVERVIEW_TABS.map((tab) => ({
        title: tab.title,
        symbols: tab.symbols.map((sym) => ({ s: sym.s, d: sym.d })),
        originalTitle: tab.originalTitle,
      })),
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: 'rgba(59, 130, 246, 1)',
      plotLineColorFalling: 'rgba(239, 68, 68, 1)',
      gridLineColor: 'rgba(255, 255, 255, 0.06)',
      scaleFontColor: 'rgba(255, 255, 255, 0.5)',
      belowLineFillColorGrowing: 'rgba(59, 130, 246, 0.12)',
      belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(59, 130, 246, 0)',
      belowLineFillColorFallingBottom: 'rgba(239, 68, 68, 0)',
      symbolActiveColor: 'rgba(59, 130, 246, 0.12)',
    }),
    []
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
      config={config}
      className={className}
    />
  );
});
