import { useMemo } from 'react';
import { useBacktestStore } from '@/stores/backtestStore';
import type { ComparisonSlot, Trade, BacktestMetrics } from '@/engine/types';

interface TimeValue {
  time: number;
  value: number;
}

interface TradeTimelineEntry {
  start: number;
  end: number;
  trade: Trade;
}

interface MetricWinner {
  winnerId: string | null;
  values: { slotId: string; value: number }[];
}

export interface ComparisonData {
  activeSlots: ComparisonSlot[];
  normalizedEquity: Map<string, TimeValue[]>;
  rollingSharpe: Map<string, TimeValue[]>;
  rollingReturn: Map<string, TimeValue[]>;
  rollingVolatility: Map<string, TimeValue[]>;
  tradeTimelines: Map<string, TradeTimelineEntry[]>;
  metricWinners: Map<string, MetricWinner>;
  summaryLines: string[];
  timeRange: { start: number; end: number };
}

const ROLLING_WINDOW = 30;

// Metrics where lower absolute value is better
const LOWER_IS_BETTER = new Set<keyof BacktestMetrics>([
  'maxDrawdown',
  'maxDrawdownDuration',
  'worstTrade',
]);

// Metrics that are neutral (no winner)
const NEUTRAL_METRICS = new Set<keyof BacktestMetrics>([
  'totalTrades',
  'avgHoldingPeriod',
]);

const METRIC_KEYS: (keyof BacktestMetrics)[] = [
  'totalReturn',
  'cagr',
  'sharpe',
  'sortino',
  'maxDrawdown',
  'winRate',
  'profitFactor',
  'totalTrades',
  'avgHoldingPeriod',
  'bestTrade',
  'worstTrade',
  'calmar',
  'expectancy',
];

function computeNormalizedEquity(slot: ComparisonSlot): TimeValue[] {
  const curve = slot.result.equityCurve;
  if (curve.length === 0) return [];
  const base = curve[0].equity;
  if (base === 0) return curve.map((p) => ({ time: p.time, value: 0 }));
  return curve.map((p) => ({ time: p.time, value: (p.equity / base) * 100 }));
}

function computeDailyReturns(equityCurve: { time: number; equity: number }[]): { time: number; ret: number }[] {
  const returns: { time: number; ret: number }[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    if (prev === 0) {
      returns.push({ time: equityCurve[i].time, ret: 0 });
    } else {
      returns.push({ time: equityCurve[i].time, ret: (equityCurve[i].equity - prev) / prev });
    }
  }
  return returns;
}

function computeRollingSharpe(dailyReturns: { time: number; ret: number }[]): TimeValue[] {
  const result: TimeValue[] = [];
  for (let i = ROLLING_WINDOW; i < dailyReturns.length; i++) {
    const window = dailyReturns.slice(i - ROLLING_WINDOW, i);
    const mean = window.reduce((s, r) => s + r.ret, 0) / ROLLING_WINDOW;
    const variance = window.reduce((s, r) => s + (r.ret - mean) ** 2, 0) / ROLLING_WINDOW;
    const std = Math.sqrt(variance);
    const sharpe = std === 0 ? 0 : (mean / std) * Math.sqrt(252);
    result.push({ time: dailyReturns[i].time, value: sharpe });
  }
  return result;
}

function computeRollingReturn(dailyReturns: { time: number; ret: number }[]): TimeValue[] {
  const result: TimeValue[] = [];
  for (let i = ROLLING_WINDOW; i < dailyReturns.length; i++) {
    const window = dailyReturns.slice(i - ROLLING_WINDOW, i);
    const cumReturn = window.reduce((acc, r) => acc * (1 + r.ret), 1) - 1;
    const annualized = (1 + cumReturn) ** (252 / ROLLING_WINDOW) - 1;
    result.push({ time: dailyReturns[i].time, value: annualized * 100 });
  }
  return result;
}

function computeRollingVolatility(dailyReturns: { time: number; ret: number }[]): TimeValue[] {
  const result: TimeValue[] = [];
  for (let i = ROLLING_WINDOW; i < dailyReturns.length; i++) {
    const window = dailyReturns.slice(i - ROLLING_WINDOW, i);
    const mean = window.reduce((s, r) => s + r.ret, 0) / ROLLING_WINDOW;
    const variance = window.reduce((s, r) => s + (r.ret - mean) ** 2, 0) / ROLLING_WINDOW;
    const annualizedVol = Math.sqrt(variance) * Math.sqrt(252) * 100;
    result.push({ time: dailyReturns[i].time, value: annualizedVol });
  }
  return result;
}

function computeTradeTimeline(slot: ComparisonSlot): TradeTimelineEntry[] {
  return slot.result.trades.map((trade) => ({
    start: trade.entryTime,
    end: trade.exitTime,
    trade,
  }));
}

function computeMetricWinners(
  slots: ComparisonSlot[]
): Map<string, MetricWinner> {
  const winners = new Map<string, MetricWinner>();

  for (const key of METRIC_KEYS) {
    const values = slots.map((s) => ({
      slotId: s.id,
      value: s.result.metrics[key],
    }));

    let winnerId: string | null = null;

    if (!NEUTRAL_METRICS.has(key)) {
      if (LOWER_IS_BETTER.has(key)) {
        // For drawdown/worst trade, closer to 0 is better (these are negative values)
        const best = values.reduce((a, b) => (Math.abs(a.value) < Math.abs(b.value) ? a : b));
        winnerId = best.slotId;
      } else {
        const best = values.reduce((a, b) => (a.value > b.value ? a : b));
        winnerId = best.slotId;
      }
    }

    winners.set(key, { winnerId, values });
  }

  return winners;
}

function computeTimeRange(slots: ComparisonSlot[]): { start: number; end: number } {
  if (slots.length === 0) return { start: 0, end: 0 };

  const starts = slots.map((s) => {
    const curve = s.result.equityCurve;
    return curve.length > 0 ? curve[0].time : 0;
  });
  const ends = slots.map((s) => {
    const curve = s.result.equityCurve;
    return curve.length > 0 ? curve[curve.length - 1].time : 0;
  });

  return {
    start: Math.max(...starts),
    end: Math.min(...ends),
  };
}

function getBest(
  slots: ComparisonSlot[],
  metric: keyof BacktestMetrics,
  direction: 'highest' | 'lowest' = 'highest'
): ComparisonSlot {
  return slots.reduce((best, slot) => {
    const bestVal = best.result.metrics[metric];
    const curVal = slot.result.metrics[metric];
    if (direction === 'highest') {
      return curVal > bestVal ? slot : best;
    }
    return Math.abs(curVal) < Math.abs(bestVal) ? slot : best;
  });
}

function generateSummary(slots: ComparisonSlot[]): string[] {
  if (slots.length < 2) return [];

  const lines: string[] = [];

  // 1. Best risk-adjusted return
  const bestSharpe = getBest(slots, 'sharpe');
  lines.push(
    `${bestSharpe.label} delivered the best risk-adjusted returns with a Sharpe ratio of ${bestSharpe.result.metrics.sharpe.toFixed(2)}.`
  );

  // 2. Return vs risk tradeoff
  const bestReturn = getBest(slots, 'totalReturn');
  const bestDrawdown = getBest(slots, 'maxDrawdown', 'lowest');
  if (bestReturn.id !== bestDrawdown.id) {
    lines.push(
      `${bestReturn.label} had the highest total return (${bestReturn.result.metrics.totalReturn.toFixed(1)}%), but ${bestDrawdown.label} had the lowest max drawdown (${bestDrawdown.result.metrics.maxDrawdown.toFixed(1)}%).`
    );
  } else {
    lines.push(
      `${bestReturn.label} led in both total return (${bestReturn.result.metrics.totalReturn.toFixed(1)}%) and lowest drawdown (${bestReturn.result.metrics.maxDrawdown.toFixed(1)}%).`
    );
  }

  // 3. Trading frequency
  const mostTrades = getBest(slots, 'totalTrades');
  const fewestTrades = slots.reduce((a, b) =>
    a.result.metrics.totalTrades < b.result.metrics.totalTrades ? a : b
  );
  if (mostTrades.id !== fewestTrades.id) {
    lines.push(
      `${mostTrades.label} was the most active with ${mostTrades.result.metrics.totalTrades} trades, while ${fewestTrades.label} traded only ${fewestTrades.result.metrics.totalTrades} times.`
    );
  }

  // 4. Consistency
  const bestWinRate = getBest(slots, 'winRate');
  const bestPF = getBest(slots, 'profitFactor');
  if (bestWinRate.id === bestPF.id) {
    lines.push(
      `${bestWinRate.label} was the most consistent, with the highest win rate (${bestWinRate.result.metrics.winRate.toFixed(1)}%) and profit factor (${bestWinRate.result.metrics.profitFactor.toFixed(2)}).`
    );
  } else {
    lines.push(
      `${bestWinRate.label} had the highest win rate (${bestWinRate.result.metrics.winRate.toFixed(1)}%), while ${bestPF.label} had the best profit factor (${bestPF.result.metrics.profitFactor.toFixed(2)}).`
    );
  }

  return lines;
}

export function useComparisonData(): ComparisonData {
  const comparisonSlots = useBacktestStore((s) => s.comparisonSlots);
  const activeComparisonIds = useBacktestStore((s) => s.activeComparisonIds);

  const activeSlots = useMemo(
    () => comparisonSlots.filter((s) => activeComparisonIds.includes(s.id)),
    [comparisonSlots, activeComparisonIds]
  );

  const normalizedEquity = useMemo(() => {
    const map = new Map<string, TimeValue[]>();
    for (const slot of activeSlots) {
      map.set(slot.id, computeNormalizedEquity(slot));
    }
    return map;
  }, [activeSlots]);

  const dailyReturnsMap = useMemo(() => {
    const map = new Map<string, { time: number; ret: number }[]>();
    for (const slot of activeSlots) {
      map.set(slot.id, computeDailyReturns(slot.result.equityCurve));
    }
    return map;
  }, [activeSlots]);

  const rollingSharpe = useMemo(() => {
    const map = new Map<string, TimeValue[]>();
    for (const slot of activeSlots) {
      const dr = dailyReturnsMap.get(slot.id) ?? [];
      map.set(slot.id, computeRollingSharpe(dr));
    }
    return map;
  }, [activeSlots, dailyReturnsMap]);

  const rollingReturn = useMemo(() => {
    const map = new Map<string, TimeValue[]>();
    for (const slot of activeSlots) {
      const dr = dailyReturnsMap.get(slot.id) ?? [];
      map.set(slot.id, computeRollingReturn(dr));
    }
    return map;
  }, [activeSlots, dailyReturnsMap]);

  const rollingVolatility = useMemo(() => {
    const map = new Map<string, TimeValue[]>();
    for (const slot of activeSlots) {
      const dr = dailyReturnsMap.get(slot.id) ?? [];
      map.set(slot.id, computeRollingVolatility(dr));
    }
    return map;
  }, [activeSlots, dailyReturnsMap]);

  const tradeTimelines = useMemo(() => {
    const map = new Map<string, TradeTimelineEntry[]>();
    for (const slot of activeSlots) {
      map.set(slot.id, computeTradeTimeline(slot));
    }
    return map;
  }, [activeSlots]);

  const metricWinners = useMemo(() => computeMetricWinners(activeSlots), [activeSlots]);

  const summaryLines = useMemo(() => generateSummary(activeSlots), [activeSlots]);

  const timeRange = useMemo(() => computeTimeRange(activeSlots), [activeSlots]);

  return {
    activeSlots,
    normalizedEquity,
    rollingSharpe,
    rollingReturn,
    rollingVolatility,
    tradeTimelines,
    metricWinners,
    summaryLines,
    timeRange,
  };
}
