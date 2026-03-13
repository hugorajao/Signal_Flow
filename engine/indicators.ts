import { Candle } from './types';

/**
 * Simple Moving Average: sum of last N closes / N
 * SMA(i) = (close[i] + close[i-1] + ... + close[i-period+1]) / period
 */
export function calcSMA(candles: Candle[], period: number): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);

  if (period <= 0 || candles.length < period) {
    return result;
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result[period - 1] = sum / period;

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result[i] = sum / period;
  }

  return result;
}

/**
 * Exponential Moving Average: uses multiplier k = 2 / (period + 1)
 * EMA(i) = close(i) * k + EMA(i-1) * (1 - k)
 * Seed: first EMA value = SMA of first `period` candles
 */
export function calcEMA(candles: Candle[], period: number): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);

  if (period <= 0 || candles.length < period) {
    return result;
  }

  const k = 2 / (period + 1);

  // Seed with SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result[i] = ema;
  }

  return result;
}

/**
 * Relative Strength Index: 100 - (100 / (1 + RS))
 * RS = average gain over `period` / average loss over `period`
 * Uses Wilder's smoothing (exponential moving average of gains/losses).
 */
export function calcRSI(candles: Candle[], period: number): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);

  if (period <= 0 || candles.length < period + 1) {
    return result;
  }

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }

  // Initial average gain/loss from first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value at index = period
  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    result[period] = 100 - 100 / (1 + avgGain / avgLoss);
  }

  // Subsequent values using Wilder's smoothing
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i + 1] = 100;
    } else {
      result[i + 1] = 100 - 100 / (1 + avgGain / avgLoss);
    }
  }

  return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * macdLine = EMA(fast) - EMA(slow)
 * signalLine = EMA(macdLine, signal period)
 * histogram = macdLine - signalLine
 */
export function calcMACD(
  candles: Candle[],
  fast: number,
  slow: number,
  signal: number
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const len = candles.length;
  const macdLine: number[] = new Array(len).fill(NaN);
  const signalLine: number[] = new Array(len).fill(NaN);
  const histogram: number[] = new Array(len).fill(NaN);

  if (fast <= 0 || slow <= 0 || signal <= 0 || len < slow) {
    return { macdLine, signalLine, histogram };
  }

  const fastEma = calcEMA(candles, fast);
  const slowEma = calcEMA(candles, slow);

  // MACD line = fast EMA - slow EMA (valid from index slow-1 onward)
  const macdStartIndex = slow - 1;
  for (let i = macdStartIndex; i < len; i++) {
    if (!isNaN(fastEma[i]) && !isNaN(slowEma[i])) {
      macdLine[i] = fastEma[i] - slowEma[i];
    }
  }

  // Signal line = EMA of MACD line values
  // Collect valid MACD values for EMA calculation
  const validMacdValues: number[] = [];
  const validMacdIndices: number[] = [];
  for (let i = 0; i < len; i++) {
    if (!isNaN(macdLine[i])) {
      validMacdValues.push(macdLine[i]);
      validMacdIndices.push(i);
    }
  }

  if (validMacdValues.length >= signal) {
    const k = 2 / (signal + 1);

    // Seed signal with SMA of first `signal` MACD values
    let sum = 0;
    for (let i = 0; i < signal; i++) {
      sum += validMacdValues[i];
    }
    let ema = sum / signal;
    signalLine[validMacdIndices[signal - 1]] = ema;

    for (let i = signal; i < validMacdValues.length; i++) {
      ema = validMacdValues[i] * k + ema * (1 - k);
      signalLine[validMacdIndices[i]] = ema;
    }
  }

  // Histogram = MACD - Signal
  for (let i = 0; i < len; i++) {
    if (!isNaN(macdLine[i]) && !isNaN(signalLine[i])) {
      histogram[i] = macdLine[i] - signalLine[i];
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands
 * middle = SMA(period)
 * upper = middle + stdDev * standardDeviation(close, period)
 * lower = middle - stdDev * standardDeviation(close, period)
 */
export function calcBollingerBands(
  candles: Candle[],
  period: number,
  stdDev: number
): { upper: number[]; middle: number[]; lower: number[] } {
  const len = candles.length;
  const upper: number[] = new Array(len).fill(NaN);
  const middle: number[] = new Array(len).fill(NaN);
  const lower: number[] = new Array(len).fill(NaN);

  if (period <= 0 || len < period) {
    return { upper, middle, lower };
  }

  const sma = calcSMA(candles, period);

  for (let i = period - 1; i < len; i++) {
    const mean = sma[i];
    if (isNaN(mean)) continue;

    // Calculate standard deviation over the window
    let sumSqDiff = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = candles[j].close - mean;
      sumSqDiff += diff * diff;
    }
    const sd = Math.sqrt(sumSqDiff / period);

    middle[i] = mean;
    upper[i] = mean + stdDev * sd;
    lower[i] = mean - stdDev * sd;
  }

  return { upper, middle, lower };
}

/**
 * Average True Range (ATR)
 * TR = max(high - low, |high - prevClose|, |low - prevClose|)
 * ATR = Wilder's smoothed average of TR over `period`
 */
export function calcATR(candles: Candle[], period: number): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);

  if (period <= 0 || candles.length < period + 1) {
    return result;
  }

  // Calculate True Range
  const tr: number[] = new Array(candles.length).fill(NaN);
  tr[0] = candles[0].high - candles[0].low; // first bar: just the range

  for (let i = 1; i < candles.length; i++) {
    const highLow = candles[i].high - candles[i].low;
    const highPrevClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowPrevClose = Math.abs(candles[i].low - candles[i - 1].close);
    tr[i] = Math.max(highLow, highPrevClose, lowPrevClose);
  }

  // First ATR = simple average of first `period` TR values (starting from index 1)
  let sum = 0;
  for (let i = 1; i <= period; i++) {
    sum += tr[i];
  }
  let atr = sum / period;
  result[period] = atr;

  // Wilder's smoothing for subsequent values
  for (let i = period + 1; i < candles.length; i++) {
    atr = (atr * (period - 1) + tr[i]) / period;
    result[i] = atr;
  }

  return result;
}

/**
 * Volume Weighted Average Price (VWAP)
 * Resets daily. VWAP = cumulative(typical_price * volume) / cumulative(volume)
 * Typical Price = (high + low + close) / 3
 * Daily reset is detected when the timestamp day changes.
 */
export function calcVWAP(candles: Candle[]): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);

  if (candles.length === 0) {
    return result;
  }

  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  let currentDay = getDayKey(candles[0].time);

  for (let i = 0; i < candles.length; i++) {
    const dayKey = getDayKey(candles[i].time);

    // Reset on new day
    if (dayKey !== currentDay) {
      cumulativeTPV = 0;
      cumulativeVolume = 0;
      currentDay = dayKey;
    }

    const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
    cumulativeTPV += typicalPrice * candles[i].volume;
    cumulativeVolume += candles[i].volume;

    if (cumulativeVolume > 0) {
      result[i] = cumulativeTPV / cumulativeVolume;
    }
  }

  return result;
}

/** Extract a day key string from a Unix timestamp (seconds). */
function getDayKey(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}
