'use client';

import { memo, useMemo } from 'react';
import { TVWidgetBase } from './TVWidgetBase';

export const TVStockHeatmap = memo(function TVStockHeatmap({
  className = '',
}: {
  className?: string;
}) {
  const config = useMemo(
    () => ({
      exchanges: [] as string[],
      dataSource: 'SPX500',
      grouping: 'sector',
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      hasTopBar: false,
      isDataSet498Enabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      width: '100%',
      height: '100%',
    }),
    []
  );

  return (
    <TVWidgetBase
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
      config={config}
      className={className}
    />
  );
});
