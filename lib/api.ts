import type { Candle } from '@/engine/types';

// --- Response types ---

export interface PriceResponse {
  symbol: string;
  timeframe: string;
  candles: Candle[];
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: 'equity' | 'crypto';
}

export interface SymbolsResponse {
  symbols: SymbolSearchResult[];
}

export interface ApiError {
  message: string;
  status: number;
}

// --- Fetch helpers ---

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    const error: ApiError = {
      message: errorBody,
      status: response.status,
    };
    throw error;
  }

  return response.json() as Promise<T>;
}

// --- Price API ---

export async function fetchPrices(
  symbol: string,
  timeframe: string,
  from: string,
  to: string,
): Promise<Candle[]> {
  const searchParams = new URLSearchParams({
    symbol,
    timeframe,
    from,
    to,
  });

  const data = await fetchJson<PriceResponse>(
    `/api/prices?${searchParams.toString()}`,
  );
  return data.candles;
}

// --- Symbols API ---

export async function searchSymbols(
  query: string,
): Promise<SymbolSearchResult[]> {
  const searchParams = new URLSearchParams();

  if (query.length > 0) {
    searchParams.set('query', query);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/symbols?${queryString}` : '/api/symbols';

  const data = await fetchJson<SymbolsResponse>(url);
  return data.symbols;
}
