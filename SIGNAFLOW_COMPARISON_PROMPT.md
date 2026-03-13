# SignaFlow — Strategy Comparison Mode

## Claude Code Session 2: Feature Branch Implementation

You are building the **Strategy Comparison Mode** for SignaFlow, a visual multi-asset backtesting engine. This feature lives in a **dedicated feature branch** (`feature/comparison`) and is designed to merge cleanly into the main app built by a parallel session.

**Your entire output goes into `features/comparison/`.** You will also make minimal, surgical edits to a few existing files to wire the feature in.

-----

## 1. Context: What Already Exists

The main session has built a full backtesting app with:

- A React Flow node canvas where users build strategies by wiring nodes
- A backtest engine that compiles graphs → runs simulations → produces `BacktestResult`
- A results panel with tabs: Equity Curve, Stats, Trades, Monthly Returns, Distribution
- TradingView widget integrations throughout

**Key types you depend on (already defined in `engine/types.ts`):**

```typescript
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
```

**Key store you depend on (already defined in `stores/backtestStore.ts`):**

```typescript
interface BacktestStore {
  isRunning: boolean;
  result: BacktestResult | null;
  error: string | null;
  
  // Comparison slots — already scaffolded by Session 1
  comparisonSlots: ComparisonSlot[];
  activeComparisonIds: string[];
  
  runBacktest: (strategy: CompiledStrategy) => Promise<void>;
  saveToComparison: (label?: string) => void;
  removeComparison: (id: string) => void;
  clearComparisons: () => void;
  toggleComparisonActive: (id: string) => void;
}

interface ComparisonSlot {
  id: string;
  label: string;
  result: BacktestResult;
  strategySnapshot: { nodes: Node[]; edges: Edge[] };
  savedAt: number;
  color: string;
}
```

**Comparison slot colors (already assigned):** `['#3B82F6', '#F59E0B', '#A855F7', '#10B981']`

**Design system (already defined):**

- Dark theme, CSS variables: `--bg-root: #0A0A0B`, `--bg-surface: #111113`, `--bg-elevated: #18181B`
- Fonts: JetBrains Mono (numbers), DM Sans (labels)
- Semantic colors: `--green: #22C55E`, `--red: #EF4444`, `--blue: #3B82F6`
- Dense layout: `p-3` padding, `gap-2` spacing
- All numbers in `font-mono`

-----

## 2. What You’re Building

A “Compare” tab inside the existing ResultsPanel that lets users visually compare 2–4 saved backtest runs side by side. The comparison view is a single, dense, information-rich screen that answers the question: **“Which strategy is better and why?”**

-----

## 3. File Structure

```
features/
└── comparison/
    ├── ComparisonView.tsx           # Main container — the "Compare" tab content
    ├── ComparisonHeader.tsx         # Slot selector bar + controls
    ├── OverlayEquityCurve.tsx       # Multi-line equity curve overlay (Lightweight Charts)
    ├── MetricsDeltaTable.tsx        # Side-by-side metrics with delta/winner highlighting
    ├── DrawdownOverlay.tsx          # Overlaid drawdown curves
    ├── ReturnScatter.tsx            # Scatter plot: Strategy A returns vs Strategy B returns
    ├── RollingMetrics.tsx           # Rolling Sharpe / rolling return comparison over time
    ├── TradeOverlapTimeline.tsx     # Timeline showing when each strategy was in a trade
    ├── ComparisonSummary.tsx        # AI-free plain-english summary of key differences
    └── hooks/
        └── useComparisonData.ts    # Derives all comparison data from active slots
```

-----

## 4. Component Specifications

### 4.1 ComparisonView.tsx — Main Container

The top-level component rendered inside the ResultsPanel “Compare” tab. Layout:

```
┌──────────────────────────────────────────────────────────────────┐
│  ComparisonHeader                                                │
│  [Slot A ●] [Slot B ●] [Slot C ●] [+ Add] │ [Clear All]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  OverlayEquityCurve (full width, 280px height)              │ │
│  │  Multiple equity lines overlaid, each in slot color          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────┬─────────────────────────────────┐ │
│  │  MetricsDeltaTable        │  DrawdownOverlay                │ │
│  │  (left half)              │  (right half, 200px height)     │ │
│  └───────────────────────────┴─────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────┬─────────────────────────────────┐ │
│  │  RollingMetrics           │  TradeOverlapTimeline           │ │
│  │  (left half, 180px)       │  (right half, 180px)           │ │
│  └───────────────────────────┴─────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ComparisonSummary (full width, text)                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

This scrolls vertically within the ResultsPanel. Use CSS Grid: `grid-template-columns: 1fr 1fr` for the 2-column rows.

### 4.2 ComparisonHeader.tsx

A horizontal bar showing the active comparison slots:

```
[● Golden Cross  ✕] [● RSI Reversion  ✕] [● MACD Momentum  ✕]  [+ Save Current Run]  │  [Clear All]
```

Each slot chip:

- Left: 8px color dot (the slot’s assigned color)
- Center: editable label (click to rename, inline text input)
- Right: ✕ button to remove from comparison
- Hover: subtle scale + brightness lift

**”+ Save Current Run”** button: Calls `saveToComparison()` from backtestStore. Disabled if no result exists or 4 slots are full. Shows a tooltip with the reason when disabled.

**“Clear All”** button: Requires confirmation (click once → button text changes to “Confirm?” in red for 3 seconds, then resets).

### 4.3 OverlayEquityCurve.tsx

Uses **TradingView Lightweight Charts** (`lightweight-charts` npm package):

- One `LineSeries` per active comparison slot, each in the slot’s assigned color
- All lines share the same time axis (aligned by date)
- **Normalization toggle:** Button in top-right corner to switch between:
  - **Absolute:** Raw equity values ($)
  - **Normalized:** All curves start at 100 (percentage-based, allows fair comparison across different initial capitals or time periods)
  - Default: Normalized
- Crosshair: shows all equity values at the hovered date in a tooltip
- Chart background: transparent (inherits `--bg-surface`)
- Grid: `--chart-grid` color (#1E1E22)
- Legend: slot labels in their colors, positioned top-left inside the chart

**Important implementation detail:** Lightweight Charts doesn’t natively support multi-tooltip crosshairs across series. Implement a custom tooltip using `subscribeCrosshairMove`:

```typescript
chart.subscribeCrosshairMove((param) => {
  // For each series, get the value at this time point
  // Render a custom HTML tooltip positioned at the crosshair
});
```

### 4.4 MetricsDeltaTable.tsx

A dense comparison table — the most important component in the view. Layout:

```
┌──────────────────┬──────────┬──────────┬──────────┬─────────┐
│ METRIC           │ Golden ● │ RSI ●    │ MACD ●   │  BEST   │
├──────────────────┼──────────┼──────────┼──────────┼─────────┤
│ Total Return     │  47.2%   │  31.8%   │  52.1%   │ MACD ●  │
│ CAGR             │  12.3%   │   8.9%   │  13.7%   │ MACD ●  │
│ Sharpe Ratio     │   1.84   │   1.12   │   1.67   │ Gold ●  │
│ Sortino Ratio    │   2.41   │   1.48   │   2.19   │ Gold ●  │
│ Max Drawdown     │ -12.4%   │ -18.7%   │ -15.2%   │ Gold ●  │
│ Win Rate         │  58.3%   │  52.1%   │  61.4%   │ MACD ●  │
│ Profit Factor    │   1.92   │   1.34   │   1.78   │ Gold ●  │
│ Total Trades     │    24    │    47    │    31    │    —    │
│ Avg Hold (bars)  │    18    │     7    │    12    │    —    │
│ Best Trade       │  +8.2%   │  +5.1%   │  +7.8%   │ Gold ●  │
│ Worst Trade      │  -4.1%   │  -6.3%   │  -5.2%   │ Gold ●  │
│ Calmar           │   0.99   │   0.48   │   0.90   │ Gold ●  │
│ Expectancy       │  $196    │   $67    │  $168    │ Gold ●  │
└──────────────────┴──────────┴──────────┴──────────┴─────────┘
```

**Styling rules:**

- Header row: `text-xs uppercase tracking-wide text-secondary` with color dots
- Values: `font-mono text-sm`
- “BEST” column: shows the slot’s color dot + abbreviated label for the winner
- Winner cells in each row: subtle background highlight in the winner’s color at 10% opacity (e.g., `rgba(59, 130, 246, 0.1)`)
- For metrics where lower is better (Max Drawdown, Worst Trade): invert the comparison
- For neutral metrics (Total Trades, Avg Hold): no winner, show “—”
- Row hover: `bg-white/[0.02]`
- Alternating row backgrounds: odd rows get `bg-white/[0.02]`

**Sorting:** Click any column header to sort all metrics by that strategy’s relative rank (just a visual indicator, highlight the sorted column).

### 4.5 DrawdownOverlay.tsx

Uses **Recharts** `AreaChart`:

- One area series per slot, colored with the slot’s color at 30% opacity fill
- X-axis: time (shared)
- Y-axis: drawdown % (inverted — 0% at top, worst drawdown at bottom)
- Tooltip: shows all drawdown values at hovered date
- Chart styling matches the app theme (dark background, subtle grid)

### 4.6 RollingMetrics.tsx

Uses **Recharts** `LineChart`:

A line chart showing a rolling metric over time for each strategy.

**Controls:** A small toggle in the top-right to switch between:

- Rolling Sharpe (30-day window)
- Rolling Return (30-day window, annualized)
- Rolling Volatility (30-day window, annualized)

Default: Rolling Sharpe.

One line per slot in its assigned color. This chart answers: “When did each strategy perform well vs. poorly?”

**Computation (in `useComparisonData.ts`):**

- Rolling Sharpe: for each day, compute Sharpe over the trailing 30 daily returns
- Rolling Return: for each day, compute annualized return over trailing 30 days
- Rolling Volatility: annualized std dev of trailing 30 daily returns

### 4.7 TradeOverlapTimeline.tsx

A horizontal timeline showing when each strategy had open positions. This reveals whether strategies are correlated or diversified.

```
          Jan     Feb     Mar     Apr     May     Jun
Golden ●  ▓▓▓▓░░░░░░▓▓▓▓▓▓░░░░░░░░░░▓▓▓▓▓▓▓▓░░░░
RSI    ●  ░░░░▓▓░░▓▓░░░░░░▓▓░░▓▓░░▓▓░░░░░░░░▓▓░░░░
MACD   ●  ▓▓▓▓▓▓▓▓░░░░░░▓▓▓▓▓▓▓▓░░░░░░░░▓▓▓▓▓▓▓▓░
```

Implementation:

- One row per strategy
- Filled blocks (▓) = in a trade, empty (░) = flat
- Use the slot’s color for filled blocks
- X-axis = time, aligned across all rows
- On hover over a filled block: tooltip shows the trade details (symbol, entry, exit, PnL)
- Built with plain HTML/CSS (a series of colored `<div>` blocks with calculated widths based on trade duration / total timespan)

### 4.8 ComparisonSummary.tsx

A deterministic, plain-English summary generated from the metrics (NOT AI-generated). Template-based logic:

```typescript
function generateSummary(slots: ComparisonSlot[]): string[] {
  const lines: string[] = [];
  
  // 1. Overall winner by risk-adjusted return
  const bestSharpe = getBest(slots, 'sharpe');
  lines.push(`${bestSharpe.label} delivered the best risk-adjusted returns with a Sharpe ratio of ${bestSharpe.metrics.sharpe.toFixed(2)}.`);
  
  // 2. Return vs risk tradeoff
  const bestReturn = getBest(slots, 'totalReturn');
  const bestDrawdown = getBest(slots, 'maxDrawdown', 'lowest');
  if (bestReturn.id !== bestDrawdown.id) {
    lines.push(`${bestReturn.label} had the highest total return (${fmt(bestReturn.metrics.totalReturn)}%), but ${bestDrawdown.label} had the lowest max drawdown (${fmt(bestDrawdown.metrics.maxDrawdown)}%).`);
  }
  
  // 3. Trading frequency comparison
  // 4. Consistency (win rate + profit factor)
  // 5. Time overlap assessment
  
  return lines;
}
```

Display as 3-5 short sentences in a bordered card, `text-sm text-secondary`, with relevant numbers highlighted in `text-primary font-mono`.

-----

## 5. Data Derivation Hook — `useComparisonData.ts`

This hook reads from `backtestStore.comparisonSlots` and `activeComparisonIds`, then derives all computed data needed by the comparison components:

```typescript
interface ComparisonData {
  // Active slots only
  activeSlots: ComparisonSlot[];
  
  // Normalized equity curves (all starting at 100)
  normalizedEquity: Map<string, { time: number; value: number }[]>;
  
  // Rolling metrics (30-day windows)
  rollingSharpe: Map<string, { time: number; value: number }[]>;
  rollingReturn: Map<string, { time: number; value: number }[]>;
  rollingVolatility: Map<string, { time: number; value: number }[]>;
  
  // Trade overlap data
  tradeTimelines: Map<string, { start: number; end: number; trade: Trade }[]>;
  
  // Metric comparison
  metricWinners: Map<string, { winnerId: string; values: { slotId: string; value: number }[] }>;
  
  // Summary text
  summaryLines: string[];
  
  // Time range (intersection of all slots)
  timeRange: { start: number; end: number };
}
```

**All heavy computation should be memoized** with `useMemo` keyed on `activeComparisonIds` and the slots themselves.

-----

## 6. Wiring Into the Main App

These are the **only** edits to files outside `features/comparison/`:

### 6.1 `components/panels/ResultsPanel.tsx`

Add the “Compare” tab to the tab bar:

```typescript
import { lazy, Suspense } from 'react';
const ComparisonView = lazy(() => import('@/features/comparison/ComparisonView'));

// In the tabs array:
{
  id: 'compare',
  label: 'Compare',
  badge: comparisonSlots.length >= 2 
    ? `${comparisonSlots.length} saved` 
    : 'Save 2+ runs',
  disabled: comparisonSlots.length < 2,
}

// In the tab content rendering:
{activeTab === 'compare' && (
  <Suspense fallback={<LoadingPulse />}>
    <ComparisonView />
  </Suspense>
)}
```

### 6.2 `components/panels/ResultsPanel.tsx` — Save Button

Add a “Save to Compare” button in the results header:

```typescript
<button 
  onClick={() => saveToComparison()}
  disabled={!result || comparisonSlots.length >= 4}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
             bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md
             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
>
  <Layers className="w-3.5 h-3.5" />
  Save to Compare
  {comparisonSlots.length > 0 && (
    <span className="ml-1 px-1.5 py-0.5 bg-zinc-700 rounded text-[10px]">
      {comparisonSlots.length}/4
    </span>
  )}
</button>
```

### 6.3 No other file modifications

Everything else is self-contained in `features/comparison/`. The hook reads from the existing Zustand store. The components use the existing design system CSS variables and Tailwind classes.

-----

## 7. Visual Design Details

Match the “Terminal Noir” system exactly:

- **Card borders:** `border border-zinc-800` (not `zinc-700` — one step subtler than the main app’s panels)
- **Section headers inside comparison:** `text-[11px] uppercase tracking-widest text-zinc-500 mb-2`
- **Chart backgrounds:** Fully transparent — they inherit the panel background
- **Slot color dots:** 8px circles, `rounded-full`, with a subtle `shadow-[0_0_6px]` glow in the slot color at 40% opacity
- **Winner highlighting:** A 1px left border in the winner’s color on the winning cell, plus `bg-{color}/[0.06]` fill
- **Transitions:** All state changes (toggle normalization, switch rolling metric, add/remove slot) should have a 150ms ease-out transition. No abrupt visual jumps.

### Chart Color Assignments

Each comparison slot gets a color from this fixed palette (assigned in order):

|Slot  |Color  |Hex      |Usage             |
|------|-------|---------|------------------|
|Slot A|Blue   |`#3B82F6`|Lines, fills, dots|
|Slot B|Amber  |`#F59E0B`|Lines, fills, dots|
|Slot C|Violet |`#A855F7`|Lines, fills, dots|
|Slot D|Emerald|`#10B981`|Lines, fills, dots|

These colors were chosen for maximum distinguishability on a dark background and to avoid red/green which already have semantic meaning (profit/loss).

-----

## 8. Empty & Edge States

|State                           |Display                                                                                                      |
|--------------------------------|-------------------------------------------------------------------------------------------------------------|
|< 2 slots saved                 |Tab shows “Save 2+ runs” badge, tab is disabled                                                              |
|Exactly 1 slot                  |Tab disabled, tooltip: “Save at least one more result to enable comparison”                                  |
|2+ slots, all deactivated       |Show the slot chips but render “Toggle at least 2 strategies to compare” in the content area                 |
|Slots with different date ranges|Align to the **intersection** of dates. Show a small info badge: “Comparing {N} overlapping trading days”    |
|Slots with different assets     |This is fine — the comparison is strategy-level (equity curves), not asset-level. No special handling needed.|
|4 slots full, user tries to save|“Save to Compare” button disabled, tooltip: “Remove a saved result to make room”                             |

-----

## 9. Implementation Order

1. **`useComparisonData.ts`** — the data layer. Compute normalized equity, rolling metrics, winners, summary. Test with mock ComparisonSlots.
1. **`ComparisonView.tsx` + `ComparisonHeader.tsx`** — layout shell with slot chips
1. **`MetricsDeltaTable.tsx`** — the most information-dense component, get this right first
1. **`OverlayEquityCurve.tsx`** — multi-line Lightweight Charts with normalization toggle
1. **`DrawdownOverlay.tsx`** — Recharts area overlay
1. **`RollingMetrics.tsx`** — rolling Sharpe/return/vol toggle
1. **`TradeOverlapTimeline.tsx`** — HTML/CSS timeline
1. **`ComparisonSummary.tsx`** — template-based text summary
1. **Wire into `ResultsPanel.tsx`** — add tab + save button (the only edits outside `features/`)
1. **Polish** — transitions, empty states, edge cases

-----

## 10. What NOT to Build

- ❌ Strategy optimization / parameter sweep (different feature entirely)
- ❌ Statistical significance testing (t-tests, bootstrap) — V2
- ❌ PDF/image export of comparison
- ❌ Shareable comparison links
- ❌ AI-powered comparison insights (keep it deterministic)
- ❌ Correlation matrix between strategies (V2)
- ❌ Custom metric definitions

-----

*The comparison view should feel like the “analyst’s desk” — dense, precise, and instantly revealing. When a user saves two strategies and clicks Compare, the answer to “which one is better?” should be obvious within 2 seconds of looking at the screen. Every chart, every number, every highlight should point toward that answer.*
