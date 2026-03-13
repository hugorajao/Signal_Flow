# SignaFlow — Visual Multi-Asset Backtesting Engine

A web-based visual backtesting engine where users construct quantitative trading strategies by wiring together logic nodes on a canvas, then run those strategies against historical crypto and equity data with rich performance visualization.

## Tech Stack

- **Next.js 14** (App Router) — SSR + client-heavy app shell
- **TypeScript** (strict mode) — no `any` types
- **Tailwind CSS** — dark-only "Terminal Noir" theme
- **@xyflow/react** — node canvas for strategy building
- **TradingView Lightweight Charts** — equity curves & backtest results
- **TradingView Embeddable Widgets** — live market data, heatmaps, technical analysis
- **Recharts** — statistical charts (drawdown, distribution)
- **Zustand** — global state management
- **TanStack Query** — data fetching & caching

## Features

- **Visual Strategy Builder** — drag-and-drop node canvas with 7 node types
- **7 Technical Indicators** — SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP
- **Backtest Engine** — compiles visual graphs into executable strategies
- **14 Performance Metrics** — Sharpe, Sortino, CAGR, max drawdown, win rate, profit factor, and more
- **Rich Visualizations** — equity curves, drawdown charts, trade lists, monthly returns heatmap, return distribution
- **TradingView Integration** — ticker tape, mini charts, advanced charts, technical analysis, market heatmaps
- **Multi-Asset Support** — 45 equities + 30 crypto assets
- **3 Default Templates** — Golden Cross, RSI Mean Reversion, MACD Momentum
- **localStorage Persistence** — auto-save strategies
- **Keyboard Shortcuts** — Cmd+R (run), Cmd+S (save), M (markets), F (fit view)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/              — Next.js App Router pages & API routes
components/
  canvas/         — React Flow canvas wrapper & controls
  nodes/          — 7 node types (DataSource, Indicator, Condition, Combiner, Signal, Filter, Output)
  panels/         — NodePalette, NodeInspector, BacktestPanel, ResultsPanel
  results/        — EquityCurve, PriceChart, StatsGrid, TradeList, MonthlyReturns, DistributionChart
  tradingview/    — TradingView widget wrappers (9 widgets)
  shared/         — Tooltip, Select, Slider, Badge, LoadingPulse, Kbd
  layout/         — AppShell, TopBar, StatusBar, MarketContextModal
engine/           — Pure backtest logic (no React)
  indicators.ts   — SMA, EMA, RSI, MACD, BB, ATR, VWAP
  compiler.ts     — Graph → executable pipeline
  backtester.ts   — Core backtest loop
  metrics.ts      — 14 performance metrics
  defaults.ts     — 3 strategy templates
stores/           — Zustand stores (strategy, backtest, UI)
hooks/            — useBacktest, useKeyboardShortcuts, useNodeDrag
lib/              — Utilities, constants, formatters, API wrappers
```

## Assumptions (V1)

- Long-only (no short selling)
- No slippage or commission model
- Fills at close price
- One position per asset at a time
- Daily data granularity for CoinGecko free tier

## Data Sources

- **Yahoo Finance** — equity OHLCV data (proxied via `/api/prices`)
- **CoinGecko** — crypto OHLCV data (free tier, no API key)
- **TradingView Widgets** — live market display (built-in data feed)
