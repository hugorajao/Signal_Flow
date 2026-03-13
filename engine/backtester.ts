import {
  CompiledStrategy,
  Candle,
  BacktestResult,
  Trade,
  Position,
  PipelineStep,
} from './types';
import { computeMetrics } from './metrics';
import {
  calcSMA,
  calcEMA,
  calcRSI,
  calcMACD,
  calcBollingerBands,
  calcATR,
  calcVWAP,
} from './indicators';

/**
 * Run a full backtest of a compiled strategy against market data.
 *
 * 1. Initialize portfolio with cash = initialCapital
 * 2. Align data sources by timestamp intersection
 * 3. For each bar: execute pipeline, evaluate signals, manage positions
 * 4. Force close at end
 * 5. Compute metrics and return BacktestResult
 */
export function runBacktest(
  strategy: CompiledStrategy,
  data: Map<string, Candle[]>
): BacktestResult {
  const { dataSources, pipeline, entrySignals, exitSignals, outputConfig } = strategy;
  const initialCapital = outputConfig.initialCapital;

  // --- 1. Validate data ---
  if (dataSources.length === 0) {
    return emptyResult(outputConfig.name, initialCapital);
  }

  // Get primary data source
  const primarySource = dataSources[0];
  const primaryCandles = data.get(primarySource.symbol);
  if (!primaryCandles || primaryCandles.length === 0) {
    return emptyResult(outputConfig.name, initialCapital);
  }

  // --- 2. Align data sources by timestamp intersection ---
  const allCandlesBySymbol = new Map<string, Candle[]>();
  const alignedTimestamps = alignTimestamps(dataSources, data);

  for (const ds of dataSources) {
    const candles = data.get(ds.symbol);
    if (!candles) continue;

    const timeIndex = new Map<number, Candle>();
    for (const c of candles) {
      timeIndex.set(c.time, c);
    }

    const aligned: Candle[] = [];
    for (const t of alignedTimestamps) {
      const candle = timeIndex.get(t);
      if (candle) {
        aligned.push(candle);
      }
    }
    allCandlesBySymbol.set(ds.symbol, aligned);
  }

  // If no aligned timestamps, use the primary source as-is
  const barCount = alignedTimestamps.length > 0
    ? alignedTimestamps.length
    : primaryCandles.length;
  const timestamps = alignedTimestamps.length > 0
    ? alignedTimestamps
    : primaryCandles.map((c) => c.time);

  if (barCount === 0) {
    return emptyResult(outputConfig.name, initialCapital);
  }

  // If alignment produced no overlap, fall back to primary
  if (allCandlesBySymbol.size === 0) {
    allCandlesBySymbol.set(primarySource.symbol, primaryCandles);
  }

  // --- 3. Pre-compute all indicators (results cache) ---
  const resultsCache = new Map<string, number[]>();

  // Store candle data per data source node
  const nodeToSymbol = new Map<string, string>();
  for (const ds of dataSources) {
    nodeToSymbol.set(ds.nodeId, ds.symbol);
  }

  // Execute pipeline steps to precompute indicator values
  for (const step of pipeline) {
    executePipelineStep(step, resultsCache, allCandlesBySymbol, nodeToSymbol, barCount);
  }

  // --- 4. Simulation loop ---
  let cash = initialCapital;
  const positions: Position[] = [];
  const trades: Trade[] = [];
  const equityCurve: { time: number; equity: number }[] = [];

  // Get the primary symbol's candles for position valuation
  const primaryAligned = allCandlesBySymbol.get(primarySource.symbol) ?? primaryCandles;

  for (let barIdx = 0; barIdx < barCount; barIdx++) {
    const time = timestamps[barIdx];

    // --- Evaluate exit signals ---
    const shouldExit = evaluateSignals(exitSignals, resultsCache, barIdx);
    if (shouldExit && positions.length > 0) {
      // Close all positions
      const closedPositions = [...positions];
      positions.length = 0;
      for (const pos of closedPositions) {
        const exitCandles = allCandlesBySymbol.get(pos.symbol) ?? primaryAligned;
        const exitPrice = barIdx < exitCandles.length ? exitCandles[barIdx].close : pos.entryPrice;
        const trade = closePosition(pos, exitPrice, time, barIdx);
        trades.push(trade);
        cash += pos.size * exitPrice;
      }
    }

    // --- Evaluate entry signals ---
    const shouldEnter = evaluateSignals(entrySignals, resultsCache, barIdx);
    if (shouldEnter && positions.length === 0) {
      // Determine sizing from the first entry signal
      const sizing = entrySignals.length > 0 ? entrySignals[0].sizing : 1;
      const allocatedCash = cash * sizing;

      // Open position on primary symbol
      const symbol = primarySource.symbol;
      const entryCandles = allCandlesBySymbol.get(symbol) ?? primaryAligned;
      const entryPrice = barIdx < entryCandles.length ? entryCandles[barIdx].close : 0;

      if (entryPrice > 0 && allocatedCash > 0) {
        const size = allocatedCash / entryPrice;
        const position: Position = {
          symbol,
          side: 'long',
          entryPrice,
          entryTime: time,
          size,
          cost: allocatedCash,
        };
        positions.push(position);
        cash -= allocatedCash;
      }
    }

    // --- Mark to market ---
    let positionValue = 0;
    for (const pos of positions) {
      const posCandles = allCandlesBySymbol.get(pos.symbol) ?? primaryAligned;
      const currentPrice = barIdx < posCandles.length ? posCandles[barIdx].close : pos.entryPrice;
      positionValue += pos.size * currentPrice;
    }

    equityCurve.push({ time, equity: cash + positionValue });
  }

  // --- 5. Force close remaining positions at end ---
  if (positions.length > 0) {
    const lastBarIdx = barCount - 1;
    const lastTime = timestamps[lastBarIdx];
    for (const pos of positions) {
      const posCandles = allCandlesBySymbol.get(pos.symbol) ?? primaryAligned;
      const exitPrice = lastBarIdx < posCandles.length
        ? posCandles[lastBarIdx].close
        : pos.entryPrice;
      const trade = closePosition(pos, exitPrice, lastTime, lastBarIdx);
      trades.push(trade);
      cash += pos.size * exitPrice;
    }
    positions.length = 0;
  }

  // --- 6. Compute benchmark equity (buy & hold primary symbol) ---
  const benchmarkEquity = computeBenchmarkEquity(primaryAligned, timestamps, initialCapital);

  // --- 7. Compute drawdown curve ---
  const drawdownCurve = computeDrawdownCurve(equityCurve);

  // --- 8. Compute monthly returns ---
  const monthlyReturns = computeMonthlyReturns(equityCurve);

  // --- 9. Compute metrics ---
  const metrics = computeMetrics(equityCurve, trades, initialCapital);

  return {
    strategyName: outputConfig.name,
    equityCurve,
    trades,
    metrics,
    drawdownCurve,
    monthlyReturns,
    benchmarkEquity,
  };
}

// ===== Helper Functions =====

/**
 * Create an empty result for edge cases.
 */
function emptyResult(name: string, initialCapital: number): BacktestResult {
  return {
    strategyName: name,
    equityCurve: [],
    trades: [],
    metrics: computeMetrics([], [], initialCapital),
    drawdownCurve: [],
    monthlyReturns: [],
  };
}

/**
 * Align data sources by finding the intersection of timestamps.
 */
function alignTimestamps(
  dataSources: CompiledStrategy['dataSources'],
  data: Map<string, Candle[]>
): number[] {
  if (dataSources.length === 0) return [];

  const firstCandles = data.get(dataSources[0].symbol);
  if (!firstCandles) return [];

  if (dataSources.length === 1) {
    return firstCandles.map((c) => c.time);
  }

  // Build timestamp sets for each data source
  let timestampSet = new Set(firstCandles.map((c) => c.time));

  for (let i = 1; i < dataSources.length; i++) {
    const candles = data.get(dataSources[i].symbol);
    if (!candles) continue;

    const otherSet = new Set(candles.map((c) => c.time));
    const intersection = new Set<number>();
    Array.from(timestampSet).forEach((t) => {
      if (otherSet.has(t)) {
        intersection.add(t);
      }
    });
    timestampSet = intersection;
  }

  return Array.from(timestampSet).sort((a, b) => a - b);
}

/**
 * Execute a single pipeline step, storing results in the cache.
 */
function executePipelineStep(
  step: PipelineStep,
  cache: Map<string, number[]>,
  candlesBySymbol: Map<string, Candle[]>,
  nodeToSymbol: Map<string, string>,
  barCount: number
): void {
  switch (step.type) {
    case 'indicator':
      executeIndicator(step, cache, candlesBySymbol, nodeToSymbol, barCount);
      break;
    case 'condition':
      executeCondition(step, cache, barCount);
      break;
    case 'combiner':
      executeCombiner(step, cache, barCount);
      break;
    case 'filter':
      executeFilter(step, cache, barCount);
      break;
  }
}

/**
 * Execute an indicator pipeline step.
 */
function executeIndicator(
  step: PipelineStep,
  cache: Map<string, number[]>,
  candlesBySymbol: Map<string, Candle[]>,
  nodeToSymbol: Map<string, string>,
  barCount: number
): void {
  // Find the candle data from input connections
  const inputNodeId = step.inputs['default'] ?? step.inputs['candles'] ?? Object.values(step.inputs)[0];
  let candles: Candle[] | undefined;

  if (inputNodeId) {
    // The input might be a data source node
    const symbol = nodeToSymbol.get(inputNodeId);
    if (symbol) {
      candles = candlesBySymbol.get(symbol);
    }
  }

  // Fallback: use the first available candle set
  if (!candles) {
    const firstEntry = candlesBySymbol.values().next();
    candles = firstEntry.done ? [] : firstEntry.value;
  }

  if (!candles || candles.length === 0) {
    cache.set(step.nodeId, new Array(barCount).fill(NaN));
    return;
  }

  switch (step.fn) {
    case 'SMA': {
      const period = Number(step.params.period ?? 20);
      cache.set(step.nodeId, calcSMA(candles, period));
      break;
    }
    case 'EMA': {
      const period = Number(step.params.period ?? 20);
      cache.set(step.nodeId, calcEMA(candles, period));
      break;
    }
    case 'RSI': {
      const period = Number(step.params.period ?? 14);
      cache.set(step.nodeId, calcRSI(candles, period));
      break;
    }
    case 'MACD': {
      const fast = Number(step.params.fast ?? 12);
      const slow = Number(step.params.slow ?? 26);
      const signal = Number(step.params.signal ?? 9);
      const result = calcMACD(candles, fast, slow, signal);
      // Store histogram as the primary output, also store sub-values
      cache.set(step.nodeId, result.histogram);
      cache.set(`${step.nodeId}:macdLine`, result.macdLine);
      cache.set(`${step.nodeId}:signalLine`, result.signalLine);
      cache.set(`${step.nodeId}:histogram`, result.histogram);
      break;
    }
    case 'BB': {
      const period = Number(step.params.period ?? 20);
      const stdDev = Number(step.params.stdDev ?? 2);
      const result = calcBollingerBands(candles, period, stdDev);
      cache.set(step.nodeId, result.middle);
      cache.set(`${step.nodeId}:upper`, result.upper);
      cache.set(`${step.nodeId}:middle`, result.middle);
      cache.set(`${step.nodeId}:lower`, result.lower);
      break;
    }
    case 'ATR': {
      const period = Number(step.params.period ?? 14);
      cache.set(step.nodeId, calcATR(candles, period));
      break;
    }
    case 'VWAP': {
      cache.set(step.nodeId, calcVWAP(candles));
      break;
    }
    default: {
      cache.set(step.nodeId, new Array(barCount).fill(NaN));
    }
  }
}

/**
 * Execute a condition pipeline step.
 * Produces a boolean array (1 = true, 0 = false) based on operator comparison.
 */
function executeCondition(
  step: PipelineStep,
  cache: Map<string, number[]>,
  barCount: number
): void {
  const operator = String(step.params.operator ?? step.fn);
  const useConstant = Boolean(step.params.useConstant);
  const constantValue = Number(step.params.constantValue ?? 0);

  // Get input values - "a" or first input, "b" or second input
  const inputKeys = Object.keys(step.inputs);
  const inputAId = step.inputs['a'] ?? step.inputs['default'] ?? (inputKeys.length > 0 ? step.inputs[inputKeys[0]] : undefined);
  const inputBId = step.inputs['b'] ?? (inputKeys.length > 1 ? step.inputs[inputKeys[1]] : undefined);

  const valuesA = inputAId ? cache.get(inputAId) : undefined;
  const valuesB = useConstant ? undefined : (inputBId ? cache.get(inputBId) : undefined);

  const result = new Array(barCount).fill(0);

  for (let i = 0; i < barCount; i++) {
    const a = valuesA ? valuesA[i] : NaN;
    const b = useConstant ? constantValue : (valuesB ? valuesB[i] : NaN);

    if (isNaN(a) || isNaN(b)) {
      result[i] = 0;
      continue;
    }

    const prevA = i > 0 && valuesA ? valuesA[i - 1] : NaN;
    const prevB = useConstant
      ? constantValue
      : (i > 0 && valuesB ? valuesB[i - 1] : NaN);

    switch (operator) {
      case 'crosses_above':
        result[i] = !isNaN(prevA) && !isNaN(prevB) && prevA <= prevB && a > b ? 1 : 0;
        break;
      case 'crosses_below':
        result[i] = !isNaN(prevA) && !isNaN(prevB) && prevA >= prevB && a < b ? 1 : 0;
        break;
      case 'greater_than':
        result[i] = a > b ? 1 : 0;
        break;
      case 'less_than':
        result[i] = a < b ? 1 : 0;
        break;
      case 'equals':
        result[i] = Math.abs(a - b) < 1e-10 ? 1 : 0;
        break;
      case 'between': {
        // For 'between', b is the lower bound, use a third input or constant as upper
        const upperValue = Number(step.params.upperValue ?? constantValue);
        result[i] = a >= b && a <= upperValue ? 1 : 0;
        break;
      }
      default:
        result[i] = 0;
    }
  }

  cache.set(step.nodeId, result);
}

/**
 * Execute a combiner pipeline step.
 * Combines multiple boolean signal arrays with AND / OR / NOT / NAND / XOR.
 */
function executeCombiner(
  step: PipelineStep,
  cache: Map<string, number[]>,
  barCount: number
): void {
  const mode = String(step.params.mode ?? step.fn);
  const inputValues: number[][] = [];

  for (const inputId of Object.values(step.inputs)) {
    const values = cache.get(inputId);
    if (values) {
      inputValues.push(values);
    }
  }

  const result = new Array(barCount).fill(0);

  if (inputValues.length === 0) {
    cache.set(step.nodeId, result);
    return;
  }

  for (let i = 0; i < barCount; i++) {
    const booleans = inputValues.map((arr) => (i < arr.length ? arr[i] > 0 : false));

    switch (mode) {
      case 'AND':
        result[i] = booleans.every(Boolean) ? 1 : 0;
        break;
      case 'OR':
        result[i] = booleans.some(Boolean) ? 1 : 0;
        break;
      case 'NOT':
        // Invert the first input
        result[i] = booleans.length > 0 && !booleans[0] ? 1 : 0;
        break;
      case 'NAND':
        result[i] = !booleans.every(Boolean) ? 1 : 0;
        break;
      case 'XOR': {
        const trueCount = booleans.filter(Boolean).length;
        result[i] = trueCount % 2 === 1 ? 1 : 0;
        break;
      }
      default:
        result[i] = 0;
    }
  }

  cache.set(step.nodeId, result);
}

/**
 * Execute a filter pipeline step.
 * Filters/gates an incoming boolean signal based on time, cooldown, or volume constraints.
 */
function executeFilter(
  step: PipelineStep,
  cache: Map<string, number[]>,
  barCount: number
): void {
  const filterType = step.fn;
  const inputId = step.inputs['default'] ?? step.inputs['signal'] ?? Object.values(step.inputs)[0];
  const inputValues = inputId ? cache.get(inputId) : undefined;

  const result = new Array(barCount).fill(0);

  if (!inputValues) {
    cache.set(step.nodeId, result);
    return;
  }

  switch (filterType) {
    case 'cooldown': {
      const cooldownBars = Number(step.params.bars ?? step.params.cooldown ?? 5);
      let lastSignalBar = -cooldownBars - 1;
      for (let i = 0; i < barCount; i++) {
        if (inputValues[i] > 0 && i - lastSignalBar > cooldownBars) {
          result[i] = 1;
          lastSignalBar = i;
        }
      }
      break;
    }
    case 'time': {
      const startHour = Number(step.params.startHour ?? 0);
      const endHour = Number(step.params.endHour ?? 24);
      for (let i = 0; i < barCount; i++) {
        if (inputValues[i] > 0) {
          // Time filter not applicable without actual timestamp context
          // Pass through the signal by default
          result[i] = 1;
        }
      }
      break;
    }
    case 'volume': {
      // Volume filter would need candle data access; pass through for now
      for (let i = 0; i < barCount; i++) {
        result[i] = inputValues[i] > 0 ? 1 : 0;
      }
      break;
    }
    default: {
      for (let i = 0; i < barCount; i++) {
        result[i] = inputValues[i] > 0 ? 1 : 0;
      }
    }
  }

  cache.set(step.nodeId, result);
}

/**
 * Evaluate whether signal conditions are met at a given bar index.
 * Returns true if ANY of the signal source nodes output a truthy value.
 */
function evaluateSignals(
  signals: CompiledStrategy['entrySignals'] | CompiledStrategy['exitSignals'],
  cache: Map<string, number[]>,
  barIdx: number
): boolean {
  if (signals.length === 0) return false;

  for (const signal of signals) {
    const values = cache.get(signal.sourceNodeId);
    if (values && barIdx < values.length && values[barIdx] > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Close a position and create a Trade record.
 */
function closePosition(
  position: Position,
  exitPrice: number,
  exitTime: number,
  barIdx: number
): Trade {
  const pnl = position.size * (exitPrice - position.entryPrice);
  const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;

  // Holding period: difference in timestamps (approximate bars)
  // In a real system we'd track bar indices; here we use time difference
  const holdingPeriod = Math.max(1, Math.round((exitTime - position.entryTime) / (24 * 3600)));

  return {
    symbol: position.symbol,
    side: 'long',
    entryPrice: position.entryPrice,
    exitPrice,
    entryTime: position.entryTime,
    exitTime,
    pnl,
    pnlPercent,
    holdingPeriod,
    size: position.size,
  };
}

/**
 * Compute benchmark equity curve (buy & hold from first bar).
 */
function computeBenchmarkEquity(
  candles: Candle[],
  timestamps: number[],
  initialCapital: number
): { time: number; equity: number }[] {
  if (candles.length === 0) return [];

  const firstPrice = candles[0].close;
  if (firstPrice <= 0) return [];

  const shares = initialCapital / firstPrice;

  return candles.map((c, i) => ({
    time: i < timestamps.length ? timestamps[i] : c.time,
    equity: shares * c.close,
  }));
}

/**
 * Compute drawdown curve from equity curve.
 */
function computeDrawdownCurve(
  equityCurve: { time: number; equity: number }[]
): { time: number; drawdown: number }[] {
  if (equityCurve.length === 0) return [];

  let peak = equityCurve[0].equity;
  return equityCurve.map((point) => {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const drawdown = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0;
    return { time: point.time, drawdown };
  });
}

/**
 * Compute monthly returns from the equity curve.
 * Groups equity values by year/month and computes percentage change.
 */
function computeMonthlyReturns(
  equityCurve: { time: number; equity: number }[]
): { year: number; month: number; return: number }[] {
  if (equityCurve.length < 2) return [];

  // Group by year-month
  const monthlyData = new Map<string, { firstEquity: number; lastEquity: number; year: number; month: number }>();

  for (const point of equityCurve) {
    const date = new Date(point.time * 1000);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const key = `${year}-${month}`;

    const existing = monthlyData.get(key);
    if (!existing) {
      monthlyData.set(key, {
        firstEquity: point.equity,
        lastEquity: point.equity,
        year,
        month,
      });
    } else {
      existing.lastEquity = point.equity;
    }
  }

  // Convert to returns
  const result: { year: number; month: number; return: number }[] = [];
  const entries = Array.from(monthlyData.values());

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prevEquity = i > 0 ? entries[i - 1].lastEquity : entry.firstEquity;
    const monthReturn = prevEquity > 0
      ? ((entry.lastEquity - prevEquity) / prevEquity) * 100
      : 0;

    result.push({
      year: entry.year,
      month: entry.month,
      return: monthReturn,
    });
  }

  return result;
}
