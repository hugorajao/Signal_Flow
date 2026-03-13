// All engine types for the backtest system

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  time: number;
  type: 'entry' | 'exit';
  direction: 'buy' | 'sell';
  symbol: string;
  sizing: number; // percentage of portfolio (0-1)
}

export interface Position {
  symbol: string;
  side: 'long';
  entryPrice: number;
  entryTime: number;
  size: number;
  cost: number;
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

export interface BacktestResult {
  strategyName: string;
  equityCurve: { time: number; equity: number }[];
  trades: Trade[];
  metrics: BacktestMetrics;
  drawdownCurve: { time: number; drawdown: number }[];
  monthlyReturns: { year: number; month: number; return: number }[];
  benchmarkEquity?: { time: number; equity: number }[];
}

export interface ComparisonSlot {
  id: string;
  label: string;
  result: BacktestResult;
  strategySnapshot: { nodes: StrategyNode[]; edges: StrategyEdge[] };
  savedAt: number;
  color: string;
}

export type NodeCategory = 'datasource' | 'indicator' | 'condition' | 'combiner' | 'signal' | 'filter' | 'output';

export type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BB' | 'ATR' | 'VWAP';

export type ConditionOperator = 'crosses_above' | 'crosses_below' | 'greater_than' | 'less_than' | 'between' | 'equals';

export type CombinerMode = 'AND' | 'OR' | 'NOT' | 'NAND' | 'XOR';

export type FilterType = 'time' | 'cooldown' | 'volume';

export type HandleType = 'candles' | 'value' | 'signal' | 'action';

export interface HandleDefinition {
  id: string;
  label: string;
  type: HandleType;
  position: 'left' | 'right';
}

export interface DataSourceConfig {
  nodeId: string;
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
}

export interface SignalConfig {
  nodeId: string;
  direction: 'buy' | 'sell';
  sizing: number;
  sourceNodeId: string;
}

export interface PipelineStep {
  nodeId: string;
  type: 'indicator' | 'condition' | 'combiner' | 'filter';
  fn: string;
  params: Record<string, string | number | boolean>;
  inputs: Record<string, string>;
}

export interface CompiledStrategy {
  dataSources: DataSourceConfig[];
  pipeline: PipelineStep[];
  entrySignals: SignalConfig[];
  exitSignals: SignalConfig[];
  outputConfig: { name: string; initialCapital: number };
}

// React Flow node data types
export interface BaseNodeData {
  label: string;
  category: NodeCategory;
  status: 'idle' | 'loading' | 'ready' | 'error';
  [key: string]: unknown;
}

export interface DataSourceNodeData extends BaseNodeData {
  category: 'datasource';
  symbol: string;
  timeframe: string;
  dateFrom: string;
  dateTo: string;
}

export interface IndicatorNodeData extends BaseNodeData {
  category: 'indicator';
  indicatorType: IndicatorType;
  params: Record<string, number>;
}

export interface ConditionNodeData extends BaseNodeData {
  category: 'condition';
  operator: ConditionOperator;
  constantValue?: number;
  useConstant: boolean;
}

export interface CombinerNodeData extends BaseNodeData {
  category: 'combiner';
  mode: CombinerMode;
}

export interface SignalNodeData extends BaseNodeData {
  category: 'signal';
  direction: 'buy' | 'sell';
  sizing: number;
  signalLabel: string;
}

export interface FilterNodeData extends BaseNodeData {
  category: 'filter';
  filterType: FilterType;
  params: Record<string, number>;
}

export interface OutputNodeData extends BaseNodeData {
  category: 'output';
  strategyName: string;
  initialCapital: number;
  lastResult?: { totalReturn: number; sharpe: number };
}

export type StrategyNodeData =
  | DataSourceNodeData
  | IndicatorNodeData
  | ConditionNodeData
  | CombinerNodeData
  | SignalNodeData
  | FilterNodeData
  | OutputNodeData;

export interface StrategyNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: StrategyNodeData;
}

export interface StrategyEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface SavedStrategy {
  id: string;
  name: string;
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  lastModified: number;
}
