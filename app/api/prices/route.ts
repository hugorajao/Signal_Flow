import { NextRequest, NextResponse } from 'next/server';
import type { Candle } from '@/engine/types';

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  XRP: 'ripple', ADA: 'cardano', AVAX: 'avalanche-2', DOT: 'polkadot',
  MATIC: 'matic-network', LINK: 'chainlink', ATOM: 'cosmos', UNI: 'uniswap',
  AAVE: 'aave', LTC: 'litecoin', DOGE: 'dogecoin', SHIB: 'shiba-inu',
  ARB: 'arbitrum', OP: 'optimism', FTM: 'fantom', NEAR: 'near',
  APT: 'aptos', SUI: 'sui', SEI: 'sei-network', TIA: 'celestia',
  INJ: 'injective-protocol', RUNE: 'thorchain', MKR: 'maker', SNX: 'havven',
  CRV: 'curve-dao-token', PEPE: 'pepe',
};

interface ErrorResponse {
  error: string;
}

// CoinGecko OHLC returns array of [timestamp, open, high, low, close]
type CoinGeckoOHLC = [number, number, number, number, number];

// Yahoo Finance chart response shape
interface YahooChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }> | null;
    error: { description: string } | null;
  };
}

function computeDaysFromRange(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

async function fetchCryptoCandles(symbol: string, from: string, to: string): Promise<Candle[]> {
  const coinId = COINGECKO_IDS[symbol];
  if (!coinId) {
    throw new Error(`Unsupported crypto symbol: ${symbol}`);
  }

  const days = computeDaysFromRange(from, to);
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data: CoinGeckoOHLC[] = await response.json() as CoinGeckoOHLC[];

  const fromTimestamp = new Date(from).getTime();
  const toTimestamp = new Date(to).getTime();

  return data
    .filter((item) => item[0] >= fromTimestamp && item[0] <= toTimestamp)
    .map((item): Candle => ({
      time: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0,
    }));
}

async function fetchEquityCandles(symbol: string, from: string, to: string, timeframe: string): Promise<Candle[]> {
  const period1 = Math.floor(new Date(from).getTime() / 1000);
  const period2 = Math.floor(new Date(to).getTime() / 1000);

  const intervalMap: Record<string, string> = {
    '1d': '1d',
    '4h': '1h',
    '1h': '1h',
  };
  const interval = intervalMap[timeframe] ?? '1d';

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  const data: YahooChartResponse = await response.json() as YahooChartResponse;

  if (data.chart.error) {
    throw new Error(`Yahoo Finance error: ${data.chart.error.description}`);
  }

  if (!data.chart.result || data.chart.result.length === 0) {
    throw new Error('No data returned from Yahoo Finance');
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];

  const candles: Candle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open[i];
    const high = quote.high[i];
    const low = quote.low[i];
    const close = quote.close[i];
    const volume = quote.volume[i];

    // Skip entries with null values (market holidays, etc.)
    if (open === null || high === null || low === null || close === null) {
      continue;
    }

    candles.push({
      time: timestamps[i] * 1000, // Convert to milliseconds
      open,
      high,
      low,
      close,
      volume: volume ?? 0,
    });
  }

  return candles;
}

export async function GET(request: NextRequest): Promise<NextResponse<{ symbol: string; timeframe: string; candles: Candle[] } | ErrorResponse>> {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol');
  const timeframe = searchParams.get('timeframe') ?? '1d';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!symbol || !from || !to) {
    return NextResponse.json(
      { error: 'Missing required query parameters: symbol, from, to' },
      { status: 400 },
    );
  }

  try {
    let candles: Candle[];

    if (symbol.startsWith('CRYPTO:')) {
      const ticker = symbol.replace('CRYPTO:', '');
      candles = await fetchCryptoCandles(ticker, from, to);
    } else if (symbol.startsWith('EQUITY:')) {
      const ticker = symbol.replace('EQUITY:', '');
      candles = await fetchEquityCandles(ticker, from, to, timeframe);
    } else {
      return NextResponse.json(
        { error: 'Symbol must be prefixed with CRYPTO: or EQUITY:' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { symbol, timeframe, candles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching prices';
    return NextResponse.json(
      { error: message },
      { status: 502 },
    );
  }
}
