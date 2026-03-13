'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';

export const TVCryptoHeatmap = memo(function TVCryptoHeatmap({
  className = '',
}: {
  className?: string;
}) {
  const config = useMemo(
    () => ({
      dataSource: 'Crypto',
      blockSize: 'market_cap_calc',
      blockColor: 'change',
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: '100%',
      height: '100%',
    }),
    []
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
      config={config}
      className={className}
    />
  );
});
