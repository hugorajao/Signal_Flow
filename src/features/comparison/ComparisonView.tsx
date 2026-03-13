'use client';

import { useComparisonData } from './hooks/useComparisonData';
import ComparisonHeader from './ComparisonHeader';
import OverlayEquityCurve from './OverlayEquityCurve';
import MetricsDeltaTable from './MetricsDeltaTable';
import DrawdownOverlay from './DrawdownOverlay';
import RollingMetrics from './RollingMetrics';
import TradeOverlapTimeline from './TradeOverlapTimeline';
import ComparisonSummary from './ComparisonSummary';

export default function ComparisonView() {
  const data = useComparisonData();
  const { activeSlots } = data;
  const needsMore = activeSlots.length < 2;

  return (
    <div className="flex flex-col h-full">
      <ComparisonHeader />

      {needsMore ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-zinc-500">
            Toggle at least 2 strategies to compare
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Full width: Equity Curve */}
          <OverlayEquityCurve data={data} />

          {/* Two-column row: Metrics + Drawdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <MetricsDeltaTable data={data} />
            <DrawdownOverlay data={data} />
          </div>

          {/* Two-column row: Rolling Metrics + Trade Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <RollingMetrics data={data} />
            <TradeOverlapTimeline data={data} />
          </div>

          {/* Full width: Summary */}
          <ComparisonSummary data={data} />
        </div>
      )}
    </div>
  );
}
