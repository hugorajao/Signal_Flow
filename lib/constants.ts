import type { IndicatorType, NodeCategory } from '@/engine/types';

// --- Timeframes ---

export interface TimeframeOption {
  value: string;
  label: string;
}

export const TIMEFRAMES: TimeframeOption[] = [
  { value: '1d', label: 'Daily' },
  { value: '4h', label: '4 Hour' },
  { value: '1h', label: '1 Hour' },
];

// --- Indicator Defaults ---

export type IndicatorDefaults = Record<IndicatorType, Record<string, number>>;

export const INDICATOR_DEFAULTS: IndicatorDefaults = {
  SMA: { period: 20 },
  EMA: { period: 20 },
  RSI: { period: 14 },
  MACD: { fast: 12, slow: 26, signal: 9 },
  BB: { period: 20, stdDev: 2 },
  ATR: { period: 14 },
  VWAP: {},
};

// --- Supported Equities ---

export interface EquitySymbol {
  symbol: string;
  name: string;
  exchange: string;
}

export const SUPPORTED_EQUITIES: EquitySymbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE' },
  { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE' },
  { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', exchange: 'NASDAQ' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', exchange: 'NYSE' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', exchange: 'NYSE' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', exchange: 'NASDAQ' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ' },
  { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ' },
  { symbol: 'SQ', name: 'Block Inc.', exchange: 'NYSE' },
  { symbol: 'SHOP', name: 'Shopify Inc.', exchange: 'NYSE' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSTR', name: 'MicroStrategy Inc.', exchange: 'NASDAQ' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'ARCA' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', exchange: 'ARCA' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', exchange: 'ARCA' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', exchange: 'NASDAQ' },
];

// --- Supported Crypto ---

export interface CryptoSymbol {
  symbol: string;
  name: string;
  coingeckoId: string;
}

export const SUPPORTED_CRYPTO: CryptoSymbol[] = [
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
  { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
  { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple' },
  { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano' },
  { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
  { symbol: 'DOT', name: 'Polkadot', coingeckoId: 'polkadot' },
  { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
  { symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink' },
  { symbol: 'ATOM', name: 'Cosmos', coingeckoId: 'cosmos' },
  { symbol: 'UNI', name: 'Uniswap', coingeckoId: 'uniswap' },
  { symbol: 'AAVE', name: 'Aave', coingeckoId: 'aave' },
  { symbol: 'LTC', name: 'Litecoin', coingeckoId: 'litecoin' },
  { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin' },
  { symbol: 'SHIB', name: 'Shiba Inu', coingeckoId: 'shiba-inu' },
  { symbol: 'ARB', name: 'Arbitrum', coingeckoId: 'arbitrum' },
  { symbol: 'OP', name: 'Optimism', coingeckoId: 'optimism' },
  { symbol: 'FTM', name: 'Fantom', coingeckoId: 'fantom' },
  { symbol: 'NEAR', name: 'NEAR Protocol', coingeckoId: 'near' },
  { symbol: 'APT', name: 'Aptos', coingeckoId: 'aptos' },
  { symbol: 'SUI', name: 'Sui', coingeckoId: 'sui' },
  { symbol: 'SEI', name: 'Sei', coingeckoId: 'sei-network' },
  { symbol: 'TIA', name: 'Celestia', coingeckoId: 'celestia' },
  { symbol: 'INJ', name: 'Injective', coingeckoId: 'injective-protocol' },
  { symbol: 'RUNE', name: 'THORChain', coingeckoId: 'thorchain' },
  { symbol: 'MKR', name: 'Maker', coingeckoId: 'maker' },
  { symbol: 'SNX', name: 'Synthetix', coingeckoId: 'havven' },
  { symbol: 'CRV', name: 'Curve DAO', coingeckoId: 'curve-dao-token' },
  { symbol: 'PEPE', name: 'Pepe', coingeckoId: 'pepe' },
];

// --- All Symbols (prefixed) ---

export interface UnifiedSymbol {
  id: string;
  symbol: string;
  name: string;
  type: 'equity' | 'crypto';
}

export const ALL_SYMBOLS: UnifiedSymbol[] = [
  ...SUPPORTED_EQUITIES.map((eq) => ({
    id: `EQUITY:${eq.symbol}`,
    symbol: eq.symbol,
    name: eq.name,
    type: 'equity' as const,
  })),
  ...SUPPORTED_CRYPTO.map((cr) => ({
    id: `CRYPTO:${cr.symbol}`,
    symbol: cr.symbol,
    name: cr.name,
    type: 'crypto' as const,
  })),
];

// --- Node Categories ---

export interface NodeCategoryInfo {
  key: NodeCategory;
  label: string;
  color: string;
  description: string;
}

export const NODE_CATEGORIES: NodeCategoryInfo[] = [
  { key: 'datasource', label: 'Data Source', color: '#00D4FF', description: 'Fetch OHLCV price data for a symbol and timeframe' },
  { key: 'indicator', label: 'Indicator', color: '#FFB800', description: 'Calculate technical indicators from price data' },
  { key: 'condition', label: 'Condition', color: '#A855F7', description: 'Compare indicator values to generate boolean signals' },
  { key: 'combiner', label: 'Combiner', color: '#10B981', description: 'Combine multiple boolean signals with logic operators' },
  { key: 'signal', label: 'Signal', color: '#22C55E', description: 'Define entry or exit trade signals with sizing' },
  { key: 'filter', label: 'Filter', color: '#94A3B8', description: 'Apply time, cooldown, or volume filters to signals' },
  { key: 'output', label: 'Output', color: '#F8FAFC', description: 'Strategy output node that triggers backtesting' },
];

// --- Comparison Colors ---

export const COMPARISON_COLORS = ['#3B82F6', '#F59E0B', '#A855F7', '#10B981'];
