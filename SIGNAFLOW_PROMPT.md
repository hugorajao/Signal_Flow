# SignaFlow — Visual Multi-Asset Backtesting Engine

## Claude Code Implementation Prompt

You are building **SignaFlow**, a web-based visual backtesting engine where users construct quantitative trading strategies by wiring together logic nodes on a canvas, then run those strategies against historical crypto and equity data with rich performance visualization. Think “Unreal Blueprints meets Bloomberg Terminal.”

This is a **single-session, full implementation**. Every file, every component, every utility — built and working by the end.

-----

## 1. Tech Stack (Non-Negotiable)

|Layer               |Choice                                                 |Why                                                                                                                                       |
|--------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
|Framework           |**Next.js 14** (App Router)                            |SSR for SEO landing, client-heavy app shell                                                                                               |
|Language            |**TypeScript** (strict mode)                           |No `any` types. Ever.                                                                                                                     |
|Styling             |**Tailwind CSS**                                       |Utility-first, dark theme via CSS variables                                                                                               |
|Node Editor         |**@xyflow/react** (v12+, formerly React Flow)          |Best-in-class node canvas library                                                                                                         |
|Charts (custom data)|**Lightweight Charts** (TradingView) + **Recharts**    |Lightweight Charts for equity curves & backtest results, Recharts for statistical charts (drawdown, distribution)                         |
|Charts (live market)|**TradingView Embeddable Widgets** (free, script-based)|Advanced Chart, Mini Chart, Ticker Tape, Technical Analysis, Symbol Overview, Heatmaps — all with built-in real-time data from TradingView|
|State               |**Zustand**                                            |Global store for strategy graph, backtest state, results                                                                                  |
|Data Fetching       |**TanStack Query** (React Query v5)                    |Cache management for API calls                                                                                                            |
|Icons               |**Lucide React**                                       |Consistent, crisp icon set                                                                                                                |
|Deployment          |**Vercel**                                             |Zero-config Next.js hosting                                                                                                               |

**Do NOT install:** Framer Motion (too heavy for this), `react-tradingview-embed` or any third-party TradingView React wrapper (they’re outdated and brittle — embed widgets directly via script tags using a custom React wrapper as described in Section 3), any paid charting library, any database/ORM, any auth library. This is a stateless client-side tool.

-----

## 2. Project Structure

```
signaflow/
├── app/
│   ├── layout.tsx                    # Root layout, font loading, global providers
│   ├── page.tsx                      # Landing / app shell (single-page app)
│   └── api/
│       ├── prices/
│       │   └── route.ts             # Proxy: fetches historical OHLCV (Yahoo Finance / CoinGecko)
│       └── symbols/
│           └── route.ts             # Proxy: symbol search / autocomplete
├── components/
│   ├── canvas/
│   │   ├── StrategyCanvas.tsx       # Main React Flow canvas wrapper
│   │   ├── CanvasControls.tsx       # Zoom, fit, minimap, grid toggle
│   │   └── ConnectionLine.tsx       # Custom animated connection line
│   ├── nodes/
│   │   ├── BaseNode.tsx             # Shared node chrome (header, handles, status LED)
│   │   ├── DataSourceNode.tsx       # Asset selector + timeframe + embedded TradingView Mini Chart
│   │   ├── IndicatorNode.tsx        # Technical indicator config (SMA, EMA, RSI, MACD, BB, ATR, VWAP)
│   │   ├── ConditionNode.tsx        # Comparison logic (crosses above, >, <, between, etc.)
│   │   ├── CombinerNode.tsx         # AND / OR / NOT logic gates
│   │   ├── SignalNode.tsx           # Entry signal (BUY / SELL) with position sizing
│   │   ├── FilterNode.tsx           # Time filter, volatility filter, volume filter
│   │   └── OutputNode.tsx           # Strategy output — collects all signals, triggers backtest
│   ├── panels/
│   │   ├── NodePalette.tsx          # Left sidebar: draggable node types, grouped by category
│   │   ├── NodeInspector.tsx        # Right sidebar: selected node config + TradingView Technical Analysis widget
│   │   ├── BacktestPanel.tsx        # Bottom panel: run controls, date range, initial capital
│   │   └── ResultsPanel.tsx         # Bottom panel (post-run): full results dashboard
│   ├── results/
│   │   ├── EquityCurve.tsx          # TradingView Lightweight Charts — equity + benchmark overlay
│   │   ├── PriceChart.tsx           # TradingView Advanced Chart widget — full interactive price chart with indicators
│   │   ├── DrawdownChart.tsx        # Recharts area — underwater / drawdown plot
│   │   ├── TradeList.tsx            # Virtualized table — every trade with entry/exit/PnL
│   │   ├── StatsGrid.tsx            # Key metrics cards (Sharpe, Sortino, CAGR, max DD, win rate, etc.)
│   │   ├── MonthlyReturns.tsx       # Heatmap grid — monthly returns colored by magnitude
│   │   └── DistributionChart.tsx    # Recharts histogram — return distribution + normal overlay
│   ├── tradingview/
│   │   ├── TVWidgetBase.tsx         # Core wrapper: handles script loading, container lifecycle, dark theme
│   │   ├── TVAdvancedChart.tsx      # TradingView Advanced Chart widget (full interactive chart)
│   │   ├── TVMiniChart.tsx          # TradingView Mini Chart widget (compact, for nodes & panels)
│   │   ├── TVTickerTape.tsx         # TradingView Ticker Tape widget (scrolling market ticker)
│   │   ├── TVTechnicalAnalysis.tsx  # TradingView Technical Analysis widget (buy/sell ratings)
│   │   ├── TVSymbolInfo.tsx         # TradingView Symbol Info widget (price + change)
│   │   ├── TVStockHeatmap.tsx       # TradingView Stock Heatmap widget
│   │   ├── TVCryptoHeatmap.tsx      # TradingView Crypto Coins Heatmap widget
│   │   └── TVMarketOverview.tsx     # TradingView Market Overview widget (multi-tab market summary)
│   ├── shared/
│   │   ├── Tooltip.tsx              # Minimal custom tooltip
│   │   ├── Select.tsx               # Custom styled select/dropdown
│   │   ├── Slider.tsx               # Range slider with labels
│   │   ├── Badge.tsx                # Status badges (connected, error, running)
│   │   ├── LoadingPulse.tsx         # Skeleton / pulse loader
│   │   └── Kbd.tsx                  # Keyboard shortcut badge
│   └── layout/
│       ├── AppShell.tsx             # Three-panel layout manager (sidebar + canvas + bottom)
│       ├── TopBar.tsx               # Strategy name, save/load, TradingView Ticker Tape, shortcuts
│       └── StatusBar.tsx            # Bottom bar: connection count, node count, last run time
├── engine/
│   ├── compiler.ts                  # Converts React Flow graph → executable strategy pipeline
│   ├── backtester.ts               # Core backtest loop: iterates candles, evaluates signals, tracks portfolio
│   ├── indicators.ts               # Pure functions: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP
│   ├── metrics.ts                  # Post-run analytics: Sharpe, Sortino, CAGR, max drawdown, win rate, profit factor, Calmar, expectancy
│   ├── types.ts                    # All engine types: Candle, Signal, Trade, Portfolio, BacktestResult, StrategyGraph
│   └── defaults.ts                 # Default strategy templates (Golden Cross, RSI Mean Reversion, MACD Momentum)
├── stores/
│   ├── strategyStore.ts            # Zustand: nodes, edges, selected node, strategy metadata
│   ├── backtestStore.ts            # Zustand: run state, results, comparison slots (up to 4)
│   └── uiStore.ts                  # Zustand: panel sizes, active panels, preferences
├── features/
│   └── comparison/                 # EXTENSION POINT — Strategy Comparison Mode (built separately, merged via Git)
│       └── .gitkeep                # Placeholder — Session 2 will populate this directory
├── lib/
│   ├── api.ts                      # Client-side fetch wrappers for /api/* routes
│   ├── formatters.ts               # Currency, percentage, date, large number formatting
│   ├── colors.ts                   # Chart color palette, node category colors
│   ├── tradingview.ts              # TradingView symbol mapping: internal symbol → TV symbol format
│   └── constants.ts                # Timeframes, indicator defaults, supported assets list
├── hooks/
│   ├── useBacktest.ts              # Orchestrates: compile → fetch data → run engine → store results
│   ├── useKeyboardShortcuts.ts     # Global hotkeys (Cmd+R = run, Cmd+S = save, Del = delete node)
│   └── useNodeDrag.ts              # DnD from palette onto canvas
├── public/
│   └── og.png                      # Open Graph image (generate a simple dark branded card)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

-----

## 3. TradingView Widget System

### 3.1 Architecture: Two Charting Layers

SignaFlow uses TradingView technology at two distinct levels. Understanding why is critical:

|Layer                 |Technology                                          |Purpose                                                                                   |Data Source                                               |
|----------------------|----------------------------------------------------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
|**Market Display**    |TradingView Embeddable Widgets (free)               |Show live/interactive price charts, market overviews, heatmaps, technical analysis ratings|TradingView’s built-in data feed (comes free with widgets)|
|**Backtest Results**  |TradingView Lightweight Charts (open-source npm lib)|Render equity curves, overlay trade markers from backtest results                         |Our own computed data from the backtest engine            |
|**Statistical Charts**|Recharts                                            |Drawdown plots, return distributions, heatmaps                                            |Our own computed data from the backtest engine            |

**Why two layers?** TradingView’s free widgets come with built-in real-time market data — we get professional-grade interactive charts for free. But widgets are display-only: we can’t extract their data programmatically. The backtesting engine needs raw OHLCV arrays to iterate over, so we still fetch from Yahoo Finance / CoinGecko for the engine. The result: users see beautiful TradingView charts for market context, AND get precise backtest results rendered with Lightweight Charts from computed data.

### 3.2 TradingView Symbol Format Mapping (`lib/tradingview.ts`)

TradingView widgets use their own symbol format (e.g., `NASDAQ:AAPL`, `BINANCE:BTCUSDT`). Create a mapping utility:

```typescript
// Maps our internal symbol format → TradingView widget symbol format
const TV_SYMBOL_MAP: Record<string, string> = {
  // Equities (use exchange prefix)
  'EQUITY:AAPL':  'NASDAQ:AAPL',
  'EQUITY:MSFT':  'NASDAQ:MSFT',
  'EQUITY:GOOGL': 'NASDAQ:GOOGL',
  'EQUITY:AMZN':  'NASDAQ:AMZN',
  'EQUITY:NVDA':  'NASDAQ:NVDA',
  'EQUITY:META':  'NASDAQ:META',
  'EQUITY:TSLA':  'NASDAQ:TSLA',
  'EQUITY:JPM':   'NYSE:JPM',
  'EQUITY:SPY':   'AMEX:SPY',
  'EQUITY:QQQ':   'NASDAQ:QQQ',
  // ... map all supported equities

  // Crypto (use BINANCE for most liquid pairs)
  'CRYPTO:BTC':   'BINANCE:BTCUSDT',
  'CRYPTO:ETH':   'BINANCE:ETHUSDT',
  'CRYPTO:SOL':   'BINANCE:SOLUSDT',
  // ... map all supported crypto
};

export function toTVSymbol(internalSymbol: string): string {
  return TV_SYMBOL_MAP[internalSymbol] ?? internalSymbol;
}

export function toTVSymbolList(symbols: string[]): { proName: string; title: string }[] {
  return symbols.map(s => ({
    proName: toTVSymbol(s),
    title: s.split(':')[1],
  }));
}
```

### 3.3 Widget Base Component (`TVWidgetBase.tsx`)

All TradingView widgets follow the same embed pattern: inject a `<script>` tag into a container div. Build ONE reusable wrapper that handles this lifecycle correctly in React:

```typescript
// components/tradingview/TVWidgetBase.tsx
'use client';

import { useEffect, useRef, memo } from 'react';

interface TVWidgetBaseProps {
  /** The TradingView widget script URL, e.g.:
   *  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" */
  scriptSrc: string;
  /** JSON config object passed as the script's text content */
  config: Record<string, unknown>;
  /** Container className for sizing */
  className?: string;
  /** Unique key to force remount when config changes (e.g., symbol) */
  widgetKey?: string;
}

export const TVWidgetBase = memo(function TVWidgetBase({
  scriptSrc,
  config,
  className = '',
  widgetKey,
}: TVWidgetBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget instance
    container.innerHTML = '';

    // Create widget container div (required by TradingView)
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    // Inject the TradingView script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.type = 'text/javascript';
    // TradingView reads config from the script's text content
    script.textContent = JSON.stringify({
      ...config,
      colorTheme: 'dark',                    // ALWAYS dark
      isTransparent: true,                    // Blend with our bg
      locale: 'en',
    });
    container.appendChild(script);

    return () => {
      // Cleanup on unmount
      container.innerHTML = '';
    };
  }, [scriptSrc, widgetKey, JSON.stringify(config)]);

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
    />
  );
});
```

**Critical implementation notes:**

- `'use client'` is REQUIRED — TradingView widgets use `document` and `window`
- `isTransparent: true` on every widget so they blend seamlessly into our dark panels
- `colorTheme: 'dark'` on every widget — non-negotiable
- Use `widgetKey` to force remount when the symbol changes (React won’t re-run the effect if only the config object reference changes — stringify-compare handles this, but widgetKey is the explicit escape hatch)
- Remove the default TradingView copyright link via CSS: `.tradingview-widget-copyright { display: none !important; }` (add to global CSS)

### 3.4 Widget Specifications

Build each of these as a thin wrapper around `TVWidgetBase`:

#### `TVAdvancedChart.tsx` — Full Interactive Price Chart

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js`
**Used in:** ResultsPanel (PriceChart tab), NodeInspector (when DataSource node is selected)
**Config:**

```json
{
  "symbol": "NASDAQ:AAPL",
  "interval": "D",
  "width": "100%",
  "height": "100%",
  "style": "1",
  "timezone": "Etc/UTC",
  "hide_top_toolbar": false,
  "hide_legend": false,
  "allow_symbol_change": false,
  "save_image": false,
  "studies": ["STD;RSI", "STD;MACD"],
  "support_host": "https://www.tradingview.com"
}
```

**Props:** `symbol: string` (our internal format, mapped via `toTVSymbol`), `interval?: string`, `studies?: string[]`, `height?: string`

#### `TVMiniChart.tsx` — Compact Sparkline Chart

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js`
**Used in:** DataSourceNode body (shows live price context for the selected asset inside the node itself)
**Config:**

```json
{
  "symbol": "NASDAQ:AAPL",
  "width": "100%",
  "height": 160,
  "dateRange": "1M",
  "largeChartUrl": "",
  "chartOnly": true,
  "noTimeScale": false
}
```

**Props:** `symbol: string`, `dateRange?: '1D' | '1M' | '3M' | '12M'`
**Note:** Set `chartOnly: true` to hide the symbol info header — we render our own.

#### `TVTickerTape.tsx` — Scrolling Market Ticker

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js`
**Used in:** TopBar — runs full-width across the top of the app, below the nav
**Config:**

```json
{
  "symbols": [
    { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
    { "proName": "NASDAQ:QQQ", "title": "QQQ" },
    { "proName": "BINANCE:BTCUSDT", "title": "BTC" },
    { "proName": "BINANCE:ETHUSDT", "title": "ETH" },
    { "proName": "BINANCE:SOLUSDT", "title": "SOL" },
    { "proName": "FX:EURUSD", "title": "EUR/USD" },
    { "proName": "COMEX:GC1!", "title": "Gold" },
    { "proName": "TVC:US10Y", "title": "US 10Y" }
  ],
  "showSymbolLogo": true,
  "displayMode": "adaptive"
}
```

**Behavior:** Auto-scrolls. Shows real-time prices. Provides ambient market context. Height is ~46px.

#### `TVTechnicalAnalysis.tsx` — Buy/Sell Rating Gauge

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js`
**Used in:** NodeInspector — when a DataSourceNode is selected, show the TV technical analysis gauge below the config form. This gives users instant signal context for the asset they’re building a strategy for.
**Config:**

```json
{
  "symbol": "NASDAQ:AAPL",
  "interval": "1D",
  "width": "100%",
  "height": 300,
  "showIntervalTabs": true
}
```

**Props:** `symbol: string`, `interval?: string`

#### `TVSymbolInfo.tsx` — Compact Price Display

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js`
**Used in:** DataSourceNode header (shows current price + daily change for the selected asset)
**Config:**

```json
{
  "symbol": "NASDAQ:AAPL",
  "width": "100%",
  "isTransparent": true
}
```

#### `TVStockHeatmap.tsx` — Equity Market Heatmap

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js`
**Used in:** Market Context panel (accessible from TopBar via a “Markets” toggle/modal)
**Config:**

```json
{
  "exchanges": [],
  "dataSource": "SPX500",
  "grouping": "sector",
  "blockSize": "market_cap_basic",
  "blockColor": "change",
  "symbolUrl": "",
  "hasTopBar": false,
  "width": "100%",
  "height": "100%"
}
```

#### `TVCryptoHeatmap.tsx` — Crypto Market Heatmap

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js`
**Used in:** Same Market Context panel, on a “Crypto” tab
**Config:**

```json
{
  "dataSource": "Crypto",
  "blockSize": "market_cap_calc",
  "blockColor": "change",
  "hasTopBar": false,
  "width": "100%",
  "height": "100%"
}
```

#### `TVMarketOverview.tsx` — Multi-Tab Market Summary

**Script:** `https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js`
**Used in:** Market Context panel — provides a tabbed overview (Indices, Commodities, Bonds, Forex)
**Config:**

```json
{
  "showChart": true,
  "width": "100%",
  "height": "100%",
  "plotLineColorGrowing": "#22C55E",
  "plotLineColorFalling": "#EF4444",
  "gridLineColor": "#1E1E22",
  "scaleFontColor": "#A1A1AA",
  "belowLineFillColorGrowing": "rgba(34,197,94,0.05)",
  "belowLineFillColorFalling": "rgba(239,68,68,0.05)",
  "tabs": [
    {
      "title": "Indices",
      "symbols": [
        { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
        { "s": "FOREXCOM:NSXUSD", "d": "Nasdaq 100" },
        { "s": "INDEX:DXY", "d": "US Dollar" }
      ]
    },
    {
      "title": "Crypto",
      "symbols": [
        { "s": "BINANCE:BTCUSDT", "d": "Bitcoin" },
        { "s": "BINANCE:ETHUSDT", "d": "Ethereum" },
        { "s": "BINANCE:SOLUSDT", "d": "Solana" }
      ]
    }
  ]
}
```

### 3.5 TradingView Widget Integration Points (Summary)

|App Location                        |Widget                                                      |Purpose                                                                        |
|------------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------|
|TopBar (full width, below nav)      |**Ticker Tape**                                             |Ambient real-time market context while working                                 |
|DataSourceNode body                 |**Mini Chart**                                              |Live price preview of the asset selected in the node                           |
|NodeInspector (DataSource selected) |**Advanced Chart** + **Technical Analysis**                 |Deep-dive on the asset: interactive chart + buy/sell gauge                     |
|ResultsPanel → “Price Chart” tab    |**Advanced Chart**                                          |Full TradingView chart of the backtested asset, independent of backtest results|
|Market Context modal (TopBar toggle)|**Stock Heatmap** + **Crypto Heatmap** + **Market Overview**|Quick market scan to find trade ideas before building a strategy               |

### 3.6 Performance: Lazy-Load All Widgets

TradingView widget scripts are external and can be heavy. Every widget component must be dynamically imported:

```typescript
// In any parent component:
import dynamic from 'next/dynamic';

const TVAdvancedChart = dynamic(
  () => import('@/components/tradingview/TVAdvancedChart').then(m => ({ default: m.TVAdvancedChart })),
  { ssr: false, loading: () => <LoadingPulse className="h-[400px]" /> }
);
```

**NEVER server-render any TradingView widget.** Always `{ ssr: false }`.

-----

## 4. Data Layer (Backtest Engine Data)

### 4.1 Why We Still Need Yahoo Finance / CoinGecko

TradingView widgets are display-only — they render charts with built-in data, but expose NO API to extract OHLCV arrays programmatically. The backtesting engine needs raw `Candle[]` data to iterate bar-by-bar, so we fetch from free public APIs server-side.

**The split is clean:**

- TradingView widgets = **what users SEE** (live charts, market context, analysis)
- Yahoo Finance / CoinGecko = **what the ENGINE eats** (raw OHLCV for backtesting)

### 4.2 API Routes (Server-Side Proxies)

All external API calls go through Next.js API routes to avoid CORS and protect rate limits.

#### `/api/prices/route.ts`

Accepts: `{ symbol: string, timeframe: '1d' | '4h' | '1h', from: string, to: string }`

**Logic:**

1. Determine asset class from symbol prefix convention:
- `CRYPTO:BTC` → CoinGecko `/coins/bitcoin/market_chart/range`
- `EQUITY:AAPL` → Yahoo Finance v8 chart API (`https://query1.finance.yahoo.com/v8/finance/chart/AAPL`)
1. Normalize response to unified `Candle[]` format: `{ time: number, open: number, high: number, low: number, close: number, volume: number }`
1. Cache with `Cache-Control: public, s-maxage=300` (5 min for daily data)
1. Error handling: return `{ error: string, code: number }` with appropriate status

**CoinGecko specifics:**

- Free tier: 10-30 calls/min, no API key needed
- Use `/coins/{id}/ohlc` for OHLCV (supports `days` param: 1, 7, 14, 30, 90, 180, 365, max)
- Map common symbols: BTC→bitcoin, ETH→ethereum, SOL→solana, etc. in a lookup table
- Daily granularity only on free tier — that’s fine, document this limitation

**Yahoo Finance specifics:**

- No API key needed for v8 chart endpoint
- Supports intervals: 1d, 1wk, 1mo
- Use `period1` and `period2` as Unix timestamps
- Parse from `chart.result[0].indicators.quote[0]` and `chart.result[0].timestamp`

#### `/api/symbols/route.ts`

Accepts: `{ query: string }`

Returns: top 10 matches from a hardcoded list of ~100 popular symbols (50 equities + 50 crypto). This avoids rate limiting issues with search APIs. Store the list in `lib/constants.ts`.

**Symbol list should include:**

- Equities: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, BRK-B, JPM, V, MA, UNH, HD, PG, JNJ, XOM, BAC, ABBV, KO, PEP, COST, MRK, TMO, AVGO, LLY, AMD, CRM, NFLX, ADBE, QCOM, TXN, INTC, CMCSA, NKE, DIS, PYPL, SQ, SHOP, COIN, MSTR, SPY, QQQ, IWM, GLD, TLT
- Crypto: BTC, ETH, SOL, BNB, XRP, ADA, AVAX, DOT, MATIC, LINK, ATOM, UNI, AAVE, LTC, DOGE, SHIB, ARB, OP, FTM, NEAR, APT, SUI, SEI, TIA, INJ, RUNE, MKR, SNX, CRV, PEPE

### 4.3 Data Caching Strategy

Use TanStack Query with these defaults:

```typescript
{
  staleTime: 5 * 60 * 1000,      // 5 min
  gcTime: 30 * 60 * 1000,        // 30 min garbage collection
  retry: 2,
  refetchOnWindowFocus: false,   // not needed for historical data
}
```

-----

## 5. Node System Architecture

### 5.1 Node Categories & Color Coding

Each node category has a distinct accent color used for the header bar and connection handles:

|Category   |Color        |Hex                               |
|-----------|-------------|----------------------------------|
|Data Source|Electric Blue|`#00D4FF`                         |
|Indicator  |Amber/Gold   |`#FFB800`                         |
|Condition  |Violet       |`#A855F7`                         |
|Combiner   |Emerald      |`#10B981`                         |
|Signal     |Red/Crimson  |`#EF4444` (sell) / `#22C55E` (buy)|
|Filter     |Slate/Steel  |`#94A3B8`                         |
|Output     |White/Bright |`#F8FAFC`                         |

### 5.2 Node Specifications

#### DataSourceNode

- **Inputs:** None
- **Outputs:** `candles` (Candle[])
- **Config:** Symbol search/select, timeframe dropdown, date range picker
- **Behavior:** Fetches and caches price data via `/api/prices`. Shows a **TradingView Mini Chart** (`TVMiniChart`) embedded inside the node body when a symbol is selected — this shows live price context. Green LED when data ready, yellow when loading, red on error.
- **Inspector integration:** When this node is selected, the NodeInspector right panel shows:
1. The config form (symbol, timeframe, dates) at the top
1. A `TVAdvancedChart` widget for the selected symbol (medium height, ~300px)
1. A `TVTechnicalAnalysis` gauge below the chart (shows buy/sell/neutral rating)

#### IndicatorNode

- **Inputs:** `candles` (from DataSource or another Indicator)
- **Outputs:** `value` (number[]) — the indicator’s computed series
- **Config:** Indicator type dropdown, period/params (dynamically rendered based on selected indicator)
- **Supported indicators (all implemented from scratch in `engine/indicators.ts`):**
  - **SMA** (period: number) — Simple Moving Average
  - **EMA** (period: number) — Exponential Moving Average
  - **RSI** (period: number, default 14) — Relative Strength Index
  - **MACD** (fast: 12, slow: 26, signal: 9) — outputs: macdLine, signalLine, histogram
  - **Bollinger Bands** (period: 20, stdDev: 2) — outputs: upper, middle, lower
  - **ATR** (period: 14) — Average True Range
  - **VWAP** — Volume Weighted Average Price (resets daily)
- **Display:** Shows current indicator value and a mini sparkline inside the node

#### ConditionNode

- **Inputs:** `valueA` (number[]), `valueB` (number[] or constant)
- **Outputs:** `signal` (boolean[])
- **Config:**
  - Comparison operator: `crosses_above`, `crosses_below`, `greater_than`, `less_than`, `between`, `equals`
  - Optional: constant value input (e.g., RSI > 70)
- **Display:** Shows a small green/red dot indicating the latest signal state

#### CombinerNode

- **Inputs:** `signalA` (boolean[]), `signalB` (boolean[]), optionally `signalC`
- **Outputs:** `combined` (boolean[])
- **Config:** Logic mode: AND, OR, NOT (unary), NAND, XOR
- **Display:** Logic gate icon that reflects selected mode

#### SignalNode

- **Inputs:** `trigger` (boolean[])
- **Outputs:** `action` (Signal[])
- **Config:**
  - Direction: BUY or SELL
  - Position sizing: percentage of portfolio (slider, 1-100%)
  - Label: user-editable name for the signal

#### FilterNode

- **Inputs:** `signal` (boolean[])
- **Outputs:** `filtered` (boolean[])
- **Config (one filter type per node):**
  - **Time filter:** only allow signals during specific hours/days
  - **Cooldown:** minimum bars between signals
  - **Volume filter:** only when volume > X-period average * multiplier

#### OutputNode

- **Inputs:** `buySignal` (Signal[]), `sellSignal` (Signal[])
- **Outputs:** None (terminal node)
- **Config:** Strategy name, initial capital input
- **Display:** Large “RUN BACKTEST” button that pulses when inputs are connected. Shows last run summary (total return, Sharpe) after execution.

### 5.3 BaseNode Component Pattern

Every node shares this visual chrome:

```
┌─────────────────────────────┐
│ ■ [Category Color] │ Node Title          │ ⚙ │
├─────────────────────────────┤
│                             │
│   [Node-specific content]   │
│   Config fields / displays  │
│   (TV Mini Chart if Data)   │
│                             │
├─────────────────────────────┤
│ ● input_a        output_a ● │
│ ● input_b        output_b ● │
└─────────────────────────────┘
```

- Header: 3px top border in category color, node title, settings gear icon
- Status LED: small circle in header — green (ready), yellow (computing), red (error), gray (disconnected)
- Handles: left side = inputs, right side = outputs. Styled as 10px circles with category color fill
- Body: `bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-2xl`
- Selected state: `ring-2 ring-blue-500/50` glow
- Min width: 220px, max width: 320px

### 5.4 Connection Validation

Not all outputs can connect to all inputs. Implement type checking:

- `candles` output → only connects to `candles` input
- `value` output → only connects to `valueA` or `valueB` inputs
- `signal`/`boolean` output → connects to signal/trigger/boolean inputs
- `action` output → connects to buySignal/sellSignal inputs

Invalid connections should be visually rejected (red flash on attempted connection, connection snaps back).

-----

## 6. Backtesting Engine (`engine/`)

### 6.1 Graph Compiler (`compiler.ts`)

The compiler transforms the React Flow node/edge graph into an executable pipeline:

1. **Topological sort** the graph (detect cycles → show error)
1. **Resolve execution order:** DataSource nodes first, then Indicators, Conditions, Combiners, Signals, Filters, and finally Output
1. **Return** a `CompiledStrategy` object:

```typescript
interface CompiledStrategy {
  dataSources: DataSourceConfig[];        // What data to fetch
  pipeline: PipelineStep[];               // Ordered computation steps
  entrySignals: SignalConfig[];           // Buy signals with sizing
  exitSignals: SignalConfig[];            // Sell signals
  outputConfig: { name: string; initialCapital: number };
}

interface PipelineStep {
  nodeId: string;
  type: 'indicator' | 'condition' | 'combiner' | 'filter';
  fn: string;                             // function name in engine
  params: Record<string, any>;
  inputs: { [inputName: string]: string }; // maps input name → source nodeId.outputName
}
```

### 6.2 Backtest Loop (`backtester.ts`)

```typescript
function runBacktest(strategy: CompiledStrategy, data: Map<string, Candle[]>): BacktestResult
```

**Core loop logic:**

1. Initialize portfolio: `{ cash: initialCapital, positions: Map<string, Position>, equity: [] }`
1. Align all data sources by timestamp (use intersection of available dates)
1. For each bar (candle) in chronological order:
   a. Execute pipeline steps in order, building a value cache `Map<string, number[]>`
   b. Evaluate entry signals: if triggered AND no existing position in that asset → open position
   c. Evaluate exit signals: if triggered AND position exists → close position
   d. Record portfolio equity: `cash + sum(position.size * currentPrice)`
   e. Track all trades in a `Trade[]` array
1. Force-close any open positions at the end of the data
1. Compute all metrics via `metrics.ts`
1. Return `BacktestResult`

**Position tracking:**

```typescript
interface Position {
  symbol: string;
  side: 'long';                    // V1: long only (document this)
  entryPrice: number;
  entryTime: number;
  size: number;                    // number of units
  cost: number;                    // total cost basis
}

interface Trade {
  symbol: string;
  side: 'long';
  entryPrice: number;
  exitPrice: number;
  entryTime: number;
  exitTime: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: number;           // in bars
  size: number;
}
```

**Assumptions (document in UI):**

- No shorting in V1 (long-only)
- No slippage model (fills at close price)
- No commission model (can add later)
- Position sizing: percentage of current portfolio equity at time of signal
- One position per asset at a time (no pyramiding)

### 6.3 Indicator Functions (`indicators.ts`)

All indicators are **pure functions** that take `Candle[]` and params, returning `number[]` of the same length (padded with `NaN` for insufficient lookback).

Implement each from scratch using standard formulas. Do NOT use any external TA library — this keeps the bundle small and the engine transparent.

Provide JSDoc comments with the formula for each indicator.

### 6.4 Metrics (`metrics.ts`)

Compute all of these from the equity curve and trade list:

|Metric               |Formula Notes                                          |
|---------------------|-------------------------------------------------------|
|Total Return (%)     |`(finalEquity - initialCapital) / initialCapital * 100`|
|CAGR (%)             |Annualized compound growth rate                        |
|Sharpe Ratio         |Annualized, assume risk-free rate = 0 for simplicity   |
|Sortino Ratio        |Like Sharpe but only downside deviation                |
|Max Drawdown (%)     |Worst peak-to-trough decline                           |
|Max Drawdown Duration|Longest time spent in drawdown (in bars)               |
|Win Rate (%)         |Winning trades / total trades                          |
|Profit Factor        |Gross profit / gross loss                              |
|Expectancy           |Average PnL per trade                                  |
|Calmar Ratio         |CAGR / Max Drawdown                                    |
|Total Trades         |Count                                                  |
|Avg Holding Period   |Mean bars per trade                                    |
|Best Trade (%)       |Max single trade return                                |
|Worst Trade (%)      |Min single trade return                                |
|Monthly Returns      |Array of { month, year, return% } for heatmap          |

-----

## 7. Visual Design System — “Terminal Noir”

### 7.1 Philosophy

This is a **tool for serious people doing serious work.** The aesthetic is dark, dense, information-rich — like a Bloomberg terminal crossed with a modern IDE. Every pixel communicates data. No decorative flourish without function. The TradingView widgets will feel native because they’re also in dark mode with transparent backgrounds.

### 7.2 Color Palette

```css
:root {
  /* Base surfaces — layered darkness */
  --bg-root:        #0A0A0B;          /* Deepest background */
  --bg-surface:     #111113;          /* Panel backgrounds */
  --bg-elevated:    #18181B;          /* Cards, nodes, modals */
  --bg-hover:       #1E1E22;          /* Hover states */
  --bg-active:      #27272A;          /* Active / pressed */

  /* Borders — barely visible structure */
  --border-subtle:  #1E1E22;
  --border-default: #27272A;
  --border-strong:  #3F3F46;

  /* Text hierarchy */
  --text-primary:   #F4F4F5;          /* Headlines, values */
  --text-secondary: #A1A1AA;          /* Labels, descriptions */
  --text-tertiary:  #71717A;          /* Disabled, timestamps */

  /* Semantic — financial conventions */
  --green:          #22C55E;          /* Profit, buy, positive */
  --green-dim:      #22C55E33;        /* Green backgrounds */
  --red:            #EF4444;          /* Loss, sell, negative */
  --red-dim:        #EF444433;
  --blue:           #3B82F6;          /* Neutral accent, links */
  --amber:          #F59E0B;          /* Warnings, indicators */
  --violet:         #A855F7;          /* Conditions, special */

  /* Chart-specific */
  --chart-equity:   #3B82F6;
  --chart-benchmark:#52525B;
  --chart-drawdown: #EF444480;
  --chart-grid:     #1E1E22;
}
```

### 7.3 Typography

```css
/* Load via next/font/google */
--font-mono:    'JetBrains Mono', monospace;     /* Numbers, code, values — THE primary font */
--font-sans:    'DM Sans', sans-serif;           /* Labels, UI text, descriptions */
--font-display: 'Space Grotesk', sans-serif;     /* Logo, hero headings only */
```

**Usage rules:**

- ALL numbers are rendered in `font-mono`. Always. Prices, percentages, dates, counts — everything.
- UI labels and body text use `font-sans`
- Only the app name “SignaFlow” and panel headings use `font-display`
- Font sizes: use Tailwind scale. Body: `text-sm` (14px). Small labels: `text-xs` (12px). Values: `text-base` to `text-lg`. Never larger than `text-xl` except the app logo.
- Letter-spacing: `tracking-tight` on headings, `tracking-wide` on tiny labels (uppercase)

### 7.4 TradingView Widget Styling Override

Add to `app/globals.css` to make TV widgets blend seamlessly:

```css
/* Strip TradingView branding — widgets are embedded UI, not linked content */
.tradingview-widget-copyright {
  display: none !important;
}

/* Ensure TV widget containers have no unexpected backgrounds */
.tradingview-widget-container {
  background: transparent !important;
}

/* TV widgets inside nodes need constrained sizing */
.node-tv-widget .tradingview-widget-container {
  border-radius: 4px;
  overflow: hidden;
}
```

### 7.5 Spacing & Density

This is a **dense** interface. Prioritize information density over whitespace:

- Panel padding: `p-3` (12px)
- Between sections within a panel: `gap-2` (8px)
- Between label and value: `gap-1` (4px)
- Node internal padding: `p-3`
- Grid gaps in stats: `gap-2`

### 7.6 Motion & Animation

Minimal but deliberate:

- Panel open/close: 200ms ease-out slide
- Node appear on drag-drop: 150ms scale from 0.95 + fade
- Connection line: animated dash pattern (`stroke-dasharray` animation, subtle)
- Backtest running: progress bar with a pulsing glow effect
- Results appear: staggered fade-in, 50ms delay per metric card
- Equity curve: draws left-to-right on first render (Lightweight Charts supports this)

Use CSS transitions and `@keyframes` — no Framer Motion.

### 7.7 Specific Component Styling

**Canvas background:** Dot grid pattern (like Figma/Miro), dots at `#1E1E22`, spacing 20px. Implemented via CSS `radial-gradient` on the React Flow container.

**Node shadows:** `shadow-2xl shadow-black/50` — nodes should feel like they float above the canvas.

**Connection wires:** Bezier curves with a subtle animated dash pattern. Color = output handle category color. Selected connections glow.

**Scrollbars:** Custom thin scrollbars: `scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700`.

**Panels:** Separated by 1px `--border-subtle` lines. No rounded corners on panels (sharp, terminal feel). Only nodes and buttons get rounding (`rounded-lg`).

-----

## 8. Layout & Interaction

### 8.1 App Shell Layout

```
┌────────────────────────────────────────────────────────────┐
│  TopBar: [SignaFlow logo] [Strategy: Untitled ▾]    [Markets] [⌘R Run] │
├────────────────────────────────────────────────────────────┤
│  Ticker Tape: ▸ SPY +0.4%  ▸ BTC $67,234 +2.1%  ▸ ETH ...│
├──────┬─────────────────────────────────────────┬───────────┤
│      │                                         │           │
│ Node │         Strategy Canvas                 │   Node    │
│Palette│        (React Flow)                    │ Inspector │
│ 200px│                                         │   300px   │
│      │                                         │ (shows TV │
│      │                                         │  widgets  │
│      │                                         │  when DS  │
│      │                                         │  selected)│
├──────┴──────────────────────────────────────────┴───────────┤
│  Results Panel (collapsible, 40% height when open)          │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────┐ │
│  │Price     │ Equity   │ Stats   │ Trades  │ Monthly    │ │
│  │Chart(TV) │ Curve    │ Grid    │ List    │ + Distrib  │ │
│  └──────────┴──────────┴──────────┴──────────┴────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  StatusBar: [14 nodes · 18 edges] [Last run: 2.3s] [Daily] │
└─────────────────────────────────────────────────────────────┘
```

**Key layout points:**

- **Ticker Tape** runs full-width between TopBar and the workspace — always visible, provides ambient market pulse
- **NodeInspector is 300px wide** to accommodate TradingView widgets (Advanced Chart + Technical Analysis) when a DataSource node is selected
- **ResultsPanel has a “Price Chart” tab** as the first tab — embeds a full `TVAdvancedChart` for the backtested asset, letting users interact with TradingView’s full charting tools alongside their backtest results
- **TopBar has a “Markets” button** that opens a modal/drawer with Stock Heatmap, Crypto Heatmap, and Market Overview widgets

### 8.2 Market Context Modal

Triggered by the “Markets” button in TopBar. Full-screen modal or slide-out drawer with three tabs:

1. **Stocks** — `TVStockHeatmap` (S&P 500 by default)
1. **Crypto** — `TVCryptoHeatmap`
1. **Overview** — `TVMarketOverview` (indices, commodities, bonds, forex)

Purpose: users can scan the market to find interesting assets, then close the modal and add a DataSource node for that asset.

### 8.3 Node Palette Drag & Drop

1. User drags a node type from the palette
1. Ghost preview follows the cursor onto the canvas
1. On drop: create the node at drop position with default config
1. Node immediately enters “selected” state so the inspector shows its config

### 8.4 Keyboard Shortcuts

|Shortcut            |Action                       |
|--------------------|-----------------------------|
|`⌘/Ctrl + R`        |Run backtest                 |
|`⌘/Ctrl + S`        |Save strategy to localStorage|
|`Delete / Backspace`|Delete selected nodes/edges  |
|`⌘/Ctrl + A`        |Select all                   |
|`⌘/Ctrl + D`        |Duplicate selected nodes     |
|`⌘/Ctrl + Z`        |Undo                         |
|`Space` (hold)      |Pan mode                     |
|`F`                 |Fit view                     |
|`M`                 |Toggle Markets modal         |

### 8.5 Strategy Persistence

Use `localStorage` to save/load strategies:

- Key: `signaflow:strategies`
- Value: `{ [id: string]: { name, nodes, edges, lastModified } }`
- Auto-save on every graph change (debounced 1s)
- Load last strategy on app mount
- Simple dropdown in TopBar to switch between saved strategies

-----

## 9. Default Strategy Templates

Include three pre-built strategies that users can load instantly:

### Template 1: “Golden Cross” (Equity)

- DataSource: SPY, Daily
- Indicator: SMA(50), Indicator: SMA(200)
- Condition: SMA(50) crosses above SMA(200) → BUY signal
- Condition: SMA(50) crosses below SMA(200) → SELL signal
- Output: $10,000 initial capital

### Template 2: “RSI Mean Reversion” (Crypto)

- DataSource: BTC, Daily
- Indicator: RSI(14)
- Condition: RSI < 30 → BUY signal (100%)
- Condition: RSI > 70 → SELL signal (100%)
- Output: $10,000 initial capital

### Template 3: “MACD Momentum” (Multi-Asset)

- DataSource 1: ETH, Daily / DataSource 2: NVDA, Daily
- Indicator (each): MACD(12, 26, 9)
- Condition (each): MACD histogram crosses above 0 → BUY / below 0 → SELL
- Output: $10,000 initial capital, 50% sizing per signal

Store templates in `engine/defaults.ts` as serialized React Flow graph JSON.

-----

## 10. Results Visualization

### 10.1 Price Chart Tab (`PriceChart.tsx`)

First tab in ResultsPanel. Embeds a full `TVAdvancedChart` widget for the primary backtested asset. Pre-loads the same indicators the user configured in their strategy:

```typescript
const TV_STUDY_MAP: Record<string, string> = {
  'SMA': 'STD;SMA', 'EMA': 'STD;EMA', 'RSI': 'STD;RSI',
  'MACD': 'STD;MACD', 'BB': 'STD;Bollinger_Bands', 'ATR': 'STD;ATR', 'VWAP': 'STD;VWAP',
};
```

### 10.2 Equity Curve (`EquityCurve.tsx`)

TradingView **Lightweight Charts**:

- Line series for portfolio equity (blue `#3B82F6`) with area fill gradient
- Benchmark overlay (buy & hold) in muted gray
- **Trade markers:** entry (green triangle up) and exit (red triangle down) at trade timestamps
- Crosshair tooltip: date, equity, benchmark, drawdown %
- Dark theme matching app palette

### 10.3 Stats Grid (`StatsGrid.tsx`)

Responsive grid of metric cards (3 columns). Each card: uppercase label, large mono value, colored assessment badge.

### 10.4 Trade List (`TradeList.tsx`)

Virtualized table with sortable columns. PnL colored green/red. Monospace for all numbers.

### 10.5 Monthly Returns Heatmap (`MonthlyReturns.tsx`)

Rows = years, columns = months. Diverging color scale (red → neutral → green).

### 10.6 Distribution Chart (`DistributionChart.tsx`)

Recharts histogram with normal distribution overlay. Green/red bars for positive/negative returns.

-----

## 11. Error Handling & Edge Cases

|Scenario                |Handling                                                          |
|------------------------|------------------------------------------------------------------|
|API rate limited        |Toast + aggressive caching                                        |
|No data for date range  |Warning badge on node, prevent run                                |
|Disconnected graph      |Red border on disconnected nodes, disable run                     |
|Circular dependency     |Detected in compiler, error toast + cycle highlight               |
|Zero trades             |Show results with “No trades” + flat equity line                  |
|No Output node          |Disable run, StatusBar message                                    |
|Fetch failure           |Red LED on node, error in inspector, retry button                 |
|TradingView widget fails|Styled fallback: “Chart unavailable” + retry. Never breaks layout.|
|TV widget blocks loading|All widgets lazy-loaded and non-blocking. App works without them. |

-----

## 12. Accessibility

- Keyboard-navigable interactive elements
- Focus-visible: `ring-2 ring-blue-500/50 ring-offset-2 ring-offset-zinc-900`
- ARIA labels on all buttons, inputs, charts
- Screen reader announcements for backtest lifecycle
- Contrast: 4.5:1 minimum
- Touch targets: 44px minimum
- `prefers-reduced-motion`: disable animations
- TradingView widgets: wrapped with descriptive `aria-label`

-----

## 13. Performance

- Initial load: < 2s (code-split everything heavy)
- Node operations: < 16ms
- Backtest (5yr daily, 3 indicators): < 500ms
- Bundle: < 500KB gzipped first load
- TradingView widgets: external CDN, never block render
- Dynamic imports for: `@xyflow/react`, `lightweight-charts`, `recharts`, all `tradingview/*` components

-----

## 14. Deployment Checklist

- [ ] `npm run build` — zero errors, zero warnings
- [ ] `npm run lint` — passes
- [ ] No `any` types
- [ ] Three templates load and produce valid results
- [ ] Real data from at least one equity and one crypto asset
- [ ] All 14 metrics compute correctly
- [ ] Node drag-and-drop works
- [ ] Connection validation rejects mismatches
- [ ] Keyboard shortcuts: ⌘R, Delete, F, M
- [ ] Desktop-only (warning < 1024px)
- [ ] Dark theme consistent — no white flashes
- [ ] localStorage persistence works
- [ ] TradingView Ticker Tape renders with real-time prices
- [ ] TV Mini Chart shows in DataSourceNode
- [ ] TV Advanced Chart renders in inspector and results
- [ ] TV Technical Analysis gauge renders in inspector
- [ ] Markets modal shows heatmaps + overview
- [ ] All TV widgets: dark theme, transparent, graceful fallbacks
- [ ] README.md complete

-----

## 15. Implementation Order

1. **Scaffold:** `npx create-next-app@latest signaflow --typescript --tailwind --app --eslint`
1. **Install deps:** `@xyflow/react zustand @tanstack/react-query lightweight-charts recharts lucide-react` (NO TradingView npm packages)
1. **Types & constants:** `engine/types.ts`, `lib/constants.ts`, `lib/colors.ts`, `lib/tradingview.ts`
1. **TradingView widget system:** `TVWidgetBase.tsx` → each wrapper. Test each renders with dark theme.
1. **Engine (no UI):** `indicators.ts` → `compiler.ts` → `backtester.ts` → `metrics.ts`
1. **API routes:** `/api/prices`, `/api/symbols` — test with curl
1. **Zustand stores**
1. **Layout shell:** AppShell, TopBar (with Ticker Tape), StatusBar
1. **Node system:** BaseNode → each type (DataSourceNode with TVMiniChart) → palette → DnD
1. **Canvas:** React Flow, connection validation, shortcuts
1. **Inspector:** Dynamic config + TV widgets for DataSource
1. **Backtest integration:** useBacktest hook → full pipeline
1. **Results:** PriceChart (TV) → EquityCurve → Stats → Trades → Monthly → Distribution
1. **Market Context modal**
1. **Default templates**
1. **Polish:** errors, loading, TV fallbacks, persistence, README
1. **Build & verify**

-----

## 16. Comparison Interface Contract (Extension Point)

The Strategy Comparison feature will be built in a parallel session and merged via Git. To enable a clean merge, the core app must expose these hooks:

### 16.1 BacktestStore Comparison Slots

In `backtestStore.ts`, include these fields alongside the primary result:

```typescript
interface BacktestStore {
  // Primary run
  isRunning: boolean;
  result: BacktestResult | null;
  error: string | null;
  
  // Comparison slots (up to 4 saved results)
  comparisonSlots: ComparisonSlot[];
  activeComparisonIds: string[];        // which slots are currently being compared
  
  // Actions
  runBacktest: (strategy: CompiledStrategy) => Promise<void>;
  saveToComparison: (label?: string) => void;   // saves current result to a slot
  removeComparison: (id: string) => void;
  clearComparisons: () => void;
  toggleComparisonActive: (id: string) => void;
}

interface ComparisonSlot {
  id: string;                            // nanoid
  label: string;                         // user-editable label, default: strategy name + timestamp
  result: BacktestResult;
  strategySnapshot: { nodes: Node[]; edges: Edge[] };  // frozen graph at time of save
  savedAt: number;                       // Unix timestamp
  color: string;                         // assigned from a rotating palette for chart overlays
}
```

**Implementation notes:**

- The `saveToComparison` action copies the current `result` and the current graph from `strategyStore` into a new `ComparisonSlot`
- Limit to 4 slots. If user tries to save a 5th, show a toast asking them to remove one
- Assign colors from this palette in order: `['#3B82F6', '#F59E0B', '#A855F7', '#10B981']`
- Persist comparison slots in localStorage alongside strategies

### 16.2 BacktestResult Type Must Include

Ensure `BacktestResult` in `engine/types.ts` includes all fields the comparison UI will need:

```typescript
interface BacktestResult {
  strategyName: string;
  equityCurve: { time: number; equity: number }[];
  trades: Trade[];
  metrics: BacktestMetrics;
  drawdownCurve: { time: number; drawdown: number }[];
  monthlyReturns: { year: number; month: number; return: number }[];
  benchmarkEquity?: { time: number; equity: number }[];  // buy & hold
}

interface BacktestMetrics {
  totalReturn: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  calmar: number;
  totalTrades: number;
  avgHoldingPeriod: number;
  bestTrade: number;
  worstTrade: number;
}
```

### 16.3 UI Hook Point

In the `ResultsPanel.tsx` tab bar, include a disabled “Compare” tab with a badge: “Save 2+ results to compare”. This tab will be wired up by the comparison feature module. The tab should render a component from `features/comparison/ComparisonView.tsx` if it exists, otherwise show the placeholder.

```typescript
// In ResultsPanel.tsx tab definitions:
{
  id: 'compare',
  label: 'Compare',
  badge: comparisonSlots.length < 2 ? 'Save 2+ runs' : `${comparisonSlots.length} saved`,
  disabled: comparisonSlots.length < 2,
  component: lazy(() => import('@/features/comparison/ComparisonView')),
  fallback: <ComparisonPlaceholder />  // simple "Run and save multiple strategies to compare them"
}
```

Also add a “Save to Compare” button in the ResultsPanel header (next to the results tabs) that calls `saveToComparison()`. Show it only when a result exists.

-----

## 17. What NOT to Build

- ❌ User auth / accounts
- ❌ Database / server storage
- ❌ Real-time streaming (TV widgets handle this)
- ❌ Paper/live trading
- ❌ Short selling
- ❌ Options/derivatives
- ❌ Slippage/commission (V2)
- ❌ Strategy sharing/export
- ❌ Mobile layout (desktop only)
- ❌ Light theme
- ❌ Onboarding tutorial
- ❌ Custom TV indicators / Pine Script
- ❌ TradingView Charting Library (paid) — free widgets only

-----

*Build this as if it’s going on Product Hunt tomorrow. Every interaction should feel snappy, every chart should be beautiful, every number should be precisely formatted. The node canvas is the hero — make it feel like magic when someone wires up their first strategy and watches the equity curve draw itself. The TradingView widgets should feel like native parts of the app, not bolted-on embeds.*
