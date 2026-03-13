# SignaFlow — Project Guidelines

## Tech Stack
- Next.js 14 (App Router), TypeScript (strict), Tailwind CSS
- @xyflow/react for node canvas
- TradingView Lightweight Charts + TradingView embed widgets (free)
- Recharts for statistical charts
- Zustand for state, TanStack Query for data fetching
- Lucide React for icons

## Code Conventions
- No `any` types. TypeScript strict mode.
- All numbers rendered in JetBrains Mono font
- CSS variables for theme colors (see design system in prompt)
- Dark theme only. Root background: #0A0A0B
- Dense UI: p-3 padding, gap-2 spacing
- All TradingView widgets: colorTheme="dark", isTransparent=true

## File Organization
- `engine/` — Pure backtest logic (no React imports)
- `components/` — React UI components
- `features/` — Self-contained feature modules (like comparison)
- `stores/` — Zustand stores
- `lib/` — Utilities, constants, formatters

## Branch Strategy
- `main` — Core app (canvas, nodes, engine, results, TV widgets)
- `feature/comparison` — Strategy Comparison mode (lives in features/comparison/)
- Both branches share types from engine/types.ts

## Key Interfaces (Both Sessions Must Use These Exactly)

interface BacktestResult {
  strategyName: string;
  equityCurve: { time: number; equity: number }[];
  trades: Trade[];
  metrics: BacktestMetrics;
  drawdownCurve: { time: number; drawdown: number }[];
  monthlyReturns: { year: number; month: number; return: number }[];
  benchmarkEquity?: { time: number; equity: number }[];
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

interface Trade {
  symbol: string;
  side: 'long';
  entryPrice: number;
  exitPrice: number;
  entryTime: number;
  exitTime: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: number;
  size: number;
}

interface ComparisonSlot {
  id: string;
  label: string;
  result: BacktestResult;
  strategySnapshot: { nodes: any[]; edges: any[] };
  savedAt: number;
  color: string;  // palette: ['#3B82F6', '#F59E0B', '#A855F7', '#10B981']
}
