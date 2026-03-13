import { Trade, BacktestMetrics } from './types';

/**
 * Compute all 14 backtest performance metrics from an equity curve and trade list.
 * Handles edge cases: zero trades, single trade, no losing trades, no winning trades.
 */
export function computeMetrics(
  equityCurve: { time: number; equity: number }[],
  trades: Trade[],
  initialCapital: number
): BacktestMetrics {
  const totalTrades = trades.length;
  const finalEquity = equityCurve.length > 0
    ? equityCurve[equityCurve.length - 1].equity
    : initialCapital;

  // --- totalReturn ---
  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;

  // --- CAGR ---
  const cagr = computeCAGR(equityCurve, initialCapital, finalEquity);

  // --- Daily returns for Sharpe / Sortino ---
  const dailyReturns = computeDailyReturns(equityCurve);

  // --- Sharpe Ratio (annualized, risk-free = 0) ---
  const sharpe = computeSharpe(dailyReturns);

  // --- Sortino Ratio (annualized, risk-free = 0, downside deviation only) ---
  const sortino = computeSortino(dailyReturns);

  // --- Max Drawdown ---
  const { maxDrawdown, maxDrawdownDuration } = computeDrawdownStats(equityCurve);

  // --- Win Rate ---
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

  // --- Profit Factor ---
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // --- Expectancy ---
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const expectancy = totalTrades > 0 ? totalPnl / totalTrades : 0;

  // --- Calmar Ratio ---
  const calmar = maxDrawdown !== 0 ? cagr / Math.abs(maxDrawdown) : cagr > 0 ? Infinity : 0;

  // --- Average Holding Period ---
  const avgHoldingPeriod = totalTrades > 0
    ? trades.reduce((sum, t) => sum + t.holdingPeriod, 0) / totalTrades
    : 0;

  // --- Best / Worst Trade ---
  const bestTrade = totalTrades > 0
    ? Math.max(...trades.map((t) => t.pnlPercent))
    : 0;
  const worstTrade = totalTrades > 0
    ? Math.min(...trades.map((t) => t.pnlPercent))
    : 0;

  return {
    totalReturn,
    cagr,
    sharpe,
    sortino,
    maxDrawdown,
    maxDrawdownDuration,
    winRate,
    profitFactor,
    expectancy,
    calmar,
    totalTrades,
    avgHoldingPeriod,
    bestTrade,
    worstTrade,
  };
}

/**
 * Annualized compound growth rate.
 * Assumes 252 trading days per year.
 */
function computeCAGR(
  equityCurve: { time: number; equity: number }[],
  initialCapital: number,
  finalEquity: number
): number {
  if (equityCurve.length < 2 || initialCapital <= 0) return 0;

  const firstTime = equityCurve[0].time;
  const lastTime = equityCurve[equityCurve.length - 1].time;
  const tradingDays = equityCurve.length;

  if (tradingDays <= 1) return 0;

  // Duration in years (based on bar count, assuming 252 trading days/year)
  const years = tradingDays / 252;
  if (years <= 0) return 0;

  const ratio = finalEquity / initialCapital;
  if (ratio <= 0) return -100; // total loss

  return (Math.pow(ratio, 1 / years) - 1) * 100;
}

/**
 * Compute bar-to-bar returns from the equity curve.
 */
function computeDailyReturns(equityCurve: { time: number; equity: number }[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    if (prev !== 0) {
      returns.push((equityCurve[i].equity - prev) / prev);
    } else {
      returns.push(0);
    }
  }
  return returns;
}

/**
 * Annualized Sharpe Ratio (risk-free rate = 0).
 * Sharpe = mean(returns) / std(returns) * sqrt(252)
 */
function computeSharpe(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;

  const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (dailyReturns.length - 1);
  const std = Math.sqrt(variance);

  if (std === 0) return 0;
  return (mean / std) * Math.sqrt(252);
}

/**
 * Annualized Sortino Ratio (risk-free rate = 0).
 * Like Sharpe but uses downside deviation (only negative returns).
 */
function computeSortino(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;

  const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;

  const downsideSquares = dailyReturns
    .filter((r) => r < 0)
    .map((r) => r * r);

  if (downsideSquares.length === 0) {
    // No negative returns
    return mean > 0 ? Infinity : 0;
  }

  const downsideVariance =
    downsideSquares.reduce((s, v) => s + v, 0) / dailyReturns.length;
  const downsideDev = Math.sqrt(downsideVariance);

  if (downsideDev === 0) return 0;
  return (mean / downsideDev) * Math.sqrt(252);
}

/**
 * Compute max drawdown percentage and max drawdown duration (in bars).
 */
function computeDrawdownStats(
  equityCurve: { time: number; equity: number }[]
): { maxDrawdown: number; maxDrawdownDuration: number } {
  if (equityCurve.length === 0) {
    return { maxDrawdown: 0, maxDrawdownDuration: 0 };
  }

  let peak = equityCurve[0].equity;
  let maxDd = 0;
  let maxDdDuration = 0;
  let currentDdDuration = 0;

  for (let i = 0; i < equityCurve.length; i++) {
    const equity = equityCurve[i].equity;
    if (equity > peak) {
      peak = equity;
      currentDdDuration = 0;
    } else {
      currentDdDuration++;
      const dd = ((peak - equity) / peak) * 100;
      if (dd > maxDd) {
        maxDd = dd;
      }
      if (currentDdDuration > maxDdDuration) {
        maxDdDuration = currentDdDuration;
      }
    }
  }

  return { maxDrawdown: maxDd, maxDrawdownDuration: maxDdDuration };
}
