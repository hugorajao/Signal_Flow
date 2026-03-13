export interface BacktestResult {
  strategyName: string;
  equityCurve: { time: number; equity: number }[];
  trades: Trade[];
  metrics: BacktestMetrics;
  drawdownCurve: { time: number; drawdown: number }[];
  monthlyReturns: { year: number; month: number; return: number }[];
  benchmarkEquity?: { time: number; equity: number }[];
}

export interface BacktestMetrics {
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

export interface Trade {
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

export interface ComparisonSlot {
  id: string;
  label: string;
  result: BacktestResult;
  strategySnapshot: { nodes: NodeSnapshot[]; edges: EdgeSnapshot[] };
  savedAt: number;
  color: string;
}

export interface NodeSnapshot {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface EdgeSnapshot {
  id: string;
  source: string;
  target: string;
}

export interface CompiledStrategy {
  nodes: NodeSnapshot[];
  edges: EdgeSnapshot[];
  entryConditions: unknown[];
  exitConditions: unknown[];
}

export const COMPARISON_COLORS = ['#3B82F6', '#F59E0B', '#A855F7', '#10B981'] as const;
