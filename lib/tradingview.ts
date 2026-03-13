// TradingView symbol mapping utility
// Maps internal symbols to TradingView-compatible symbol strings

const EQUITY_TV_MAP: Record<string, string> = {
  AAPL: 'NASDAQ:AAPL',
  MSFT: 'NASDAQ:MSFT',
  GOOGL: 'NASDAQ:GOOGL',
  AMZN: 'NASDAQ:AMZN',
  NVDA: 'NASDAQ:NVDA',
  META: 'NASDAQ:META',
  TSLA: 'NASDAQ:TSLA',
  'BRK-B': 'NYSE:BRK.B',
  JPM: 'NYSE:JPM',
  V: 'NYSE:V',
  MA: 'NYSE:MA',
  UNH: 'NYSE:UNH',
  HD: 'NYSE:HD',
  PG: 'NYSE:PG',
  JNJ: 'NYSE:JNJ',
  XOM: 'NYSE:XOM',
  BAC: 'NYSE:BAC',
  ABBV: 'NYSE:ABBV',
  KO: 'NYSE:KO',
  PEP: 'NASDAQ:PEP',
  COST: 'NASDAQ:COST',
  MRK: 'NYSE:MRK',
  TMO: 'NYSE:TMO',
  AVGO: 'NASDAQ:AVGO',
  LLY: 'NYSE:LLY',
  AMD: 'NASDAQ:AMD',
  CRM: 'NYSE:CRM',
  NFLX: 'NASDAQ:NFLX',
  ADBE: 'NASDAQ:ADBE',
  QCOM: 'NASDAQ:QCOM',
  TXN: 'NASDAQ:TXN',
  INTC: 'NASDAQ:INTC',
  CMCSA: 'NASDAQ:CMCSA',
  NKE: 'NYSE:NKE',
  DIS: 'NYSE:DIS',
  PYPL: 'NASDAQ:PYPL',
  SQ: 'NYSE:SQ',
  SHOP: 'NYSE:SHOP',
  COIN: 'NASDAQ:COIN',
  MSTR: 'NASDAQ:MSTR',
  SPY: 'AMEX:SPY',
  QQQ: 'NASDAQ:QQQ',
  IWM: 'AMEX:IWM',
  GLD: 'AMEX:GLD',
  TLT: 'NASDAQ:TLT',
};

const CRYPTO_TV_MAP: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDT',
  ETH: 'BINANCE:ETHUSDT',
  SOL: 'BINANCE:SOLUSDT',
  BNB: 'BINANCE:BNBUSDT',
  XRP: 'BINANCE:XRPUSDT',
  ADA: 'BINANCE:ADAUSDT',
  AVAX: 'BINANCE:AVAXUSDT',
  DOT: 'BINANCE:DOTUSDT',
  MATIC: 'BINANCE:MATICUSDT',
  LINK: 'BINANCE:LINKUSDT',
  ATOM: 'BINANCE:ATOMUSDT',
  UNI: 'BINANCE:UNIUSDT',
  AAVE: 'BINANCE:AAVEUSDT',
  LTC: 'BINANCE:LTCUSDT',
  DOGE: 'BINANCE:DOGEUSDT',
  SHIB: 'BINANCE:SHIBUSDT',
  ARB: 'BINANCE:ARBUSDT',
  OP: 'BINANCE:OPUSDT',
  FTM: 'BINANCE:FTMUSDT',
  NEAR: 'BINANCE:NEARUSDT',
  APT: 'BINANCE:APTUSDT',
  SUI: 'BINANCE:SUIUSDT',
  SEI: 'BINANCE:SEIUSDT',
  TIA: 'BINANCE:TIAUSDT',
  INJ: 'BINANCE:INJUSDT',
  RUNE: 'BINANCE:RUNEUSDT',
  MKR: 'BINANCE:MKRUSDT',
  SNX: 'BINANCE:SNXUSDT',
  CRV: 'BINANCE:CRVUSDT',
  PEPE: 'BINANCE:PEPEUSDT',
};

/**
 * Convert an internal symbol string to a TradingView-compatible symbol.
 * Accepts both prefixed (EQUITY:AAPL, CRYPTO:BTC) and bare (AAPL, BTC) formats.
 */
export function toTradingViewSymbol(symbol: string): string {
  // Handle prefixed format
  if (symbol.startsWith('EQUITY:')) {
    const bare = symbol.slice(7);
    return EQUITY_TV_MAP[bare] ?? `NASDAQ:${bare}`;
  }
  if (symbol.startsWith('CRYPTO:')) {
    const bare = symbol.slice(7);
    return CRYPTO_TV_MAP[bare] ?? `BINANCE:${bare}USDT`;
  }

  // Handle bare format - check equities first, then crypto
  if (EQUITY_TV_MAP[symbol]) {
    return EQUITY_TV_MAP[symbol];
  }
  if (CRYPTO_TV_MAP[symbol]) {
    return CRYPTO_TV_MAP[symbol];
  }

  // Fallback: assume NASDAQ equity
  return `NASDAQ:${symbol}`;
}

/**
 * Map internal timeframe values to TradingView interval strings.
 */
export function toTradingViewInterval(timeframe: string): string {
  const map: Record<string, string> = {
    '1h': '60',
    '4h': '240',
    '1d': 'D',
    '1w': 'W',
    '1M': 'M',
  };
  return map[timeframe] ?? 'D';
}

/**
 * Check if a symbol is a crypto symbol.
 */
export function isCryptoSymbol(symbol: string): boolean {
  if (symbol.startsWith('CRYPTO:')) return true;
  if (symbol.startsWith('EQUITY:')) return false;
  return symbol in CRYPTO_TV_MAP;
}

/**
 * Check if a symbol is an equity symbol.
 */
export function isEquitySymbol(symbol: string): boolean {
  if (symbol.startsWith('EQUITY:')) return true;
  if (symbol.startsWith('CRYPTO:')) return false;
  return symbol in EQUITY_TV_MAP;
}

/**
 * Extract the bare symbol from a prefixed symbol string.
 * e.g., "EQUITY:AAPL" -> "AAPL", "CRYPTO:BTC" -> "BTC", "AAPL" -> "AAPL"
 */
export function toBareSymbol(symbol: string): string {
  if (symbol.startsWith('EQUITY:')) return symbol.slice(7);
  if (symbol.startsWith('CRYPTO:')) return symbol.slice(7);
  return symbol;
}

/**
 * Build a TradingView widget configuration object with dark theme defaults.
 */
export function buildTVWidgetConfig(symbol: string, timeframe: string): {
  symbol: string;
  interval: string;
  theme: 'dark';
  isTransparent: true;
} {
  return {
    symbol: toTradingViewSymbol(symbol),
    interval: toTradingViewInterval(timeframe),
    theme: 'dark',
    isTransparent: true,
  };
}
