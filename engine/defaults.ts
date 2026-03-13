import {
  StrategyNode,
  StrategyEdge,
  DataSourceNodeData,
  IndicatorNodeData,
  ConditionNodeData,
  SignalNodeData,
  OutputNodeData,
  CombinerNodeData,
} from './types';

interface StrategyTemplate {
  name: string;
  nodes: StrategyNode[];
  edges: StrategyEdge[];
}

/**
 * Golden Cross strategy: SPY, SMA(50) crosses above SMA(200) to buy,
 * crosses below to sell.
 */
export const goldenCrossTemplate: StrategyTemplate = {
  name: 'Golden Cross',
  nodes: [
    // DataSource: SPY
    {
      id: 'ds-1',
      type: 'datasource',
      position: { x: 50, y: 200 },
      data: {
        label: 'SPY Daily',
        category: 'datasource',
        status: 'idle',
        symbol: 'SPY',
        timeframe: '1D',
        dateFrom: '2020-01-01',
        dateTo: '2024-01-01',
      } as DataSourceNodeData,
    },
    // Indicator: SMA(50)
    {
      id: 'ind-sma50',
      type: 'indicator',
      position: { x: 350, y: 100 },
      data: {
        label: 'SMA (50)',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'SMA',
        params: { period: 50 },
      } as IndicatorNodeData,
    },
    // Indicator: SMA(200)
    {
      id: 'ind-sma200',
      type: 'indicator',
      position: { x: 350, y: 300 },
      data: {
        label: 'SMA (200)',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'SMA',
        params: { period: 200 },
      } as IndicatorNodeData,
    },
    // Condition: SMA50 crosses above SMA200 (buy)
    {
      id: 'cond-cross-above',
      type: 'condition',
      position: { x: 650, y: 100 },
      data: {
        label: 'Crosses Above',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_above',
        useConstant: false,
      } as ConditionNodeData,
    },
    // Condition: SMA50 crosses below SMA200 (sell)
    {
      id: 'cond-cross-below',
      type: 'condition',
      position: { x: 650, y: 300 },
      data: {
        label: 'Crosses Below',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_below',
        useConstant: false,
      } as ConditionNodeData,
    },
    // Signal: Buy
    {
      id: 'sig-buy',
      type: 'signal',
      position: { x: 950, y: 100 },
      data: {
        label: 'Buy Signal',
        category: 'signal',
        status: 'idle',
        direction: 'buy',
        sizing: 1,
        signalLabel: 'Golden Cross Buy',
      } as SignalNodeData,
    },
    // Signal: Sell
    {
      id: 'sig-sell',
      type: 'signal',
      position: { x: 950, y: 300 },
      data: {
        label: 'Sell Signal',
        category: 'signal',
        status: 'idle',
        direction: 'sell',
        sizing: 1,
        signalLabel: 'Death Cross Sell',
      } as SignalNodeData,
    },
    // Output
    {
      id: 'output-1',
      type: 'output',
      position: { x: 1250, y: 200 },
      data: {
        label: 'Output',
        category: 'output',
        status: 'idle',
        strategyName: 'Golden Cross',
        initialCapital: 100000,
      } as OutputNodeData,
    },
  ],
  edges: [
    // DataSource -> both SMAs
    { id: 'e-ds-sma50', source: 'ds-1', target: 'ind-sma50', sourceHandle: 'candles', targetHandle: 'candles' },
    { id: 'e-ds-sma200', source: 'ds-1', target: 'ind-sma200', sourceHandle: 'candles', targetHandle: 'candles' },
    // SMA50 -> Condition A input, SMA200 -> Condition B input (crosses above)
    { id: 'e-sma50-cross-above-a', source: 'ind-sma50', target: 'cond-cross-above', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-sma200-cross-above-b', source: 'ind-sma200', target: 'cond-cross-above', sourceHandle: 'value', targetHandle: 'b' },
    // SMA50 -> Condition A input, SMA200 -> Condition B input (crosses below)
    { id: 'e-sma50-cross-below-a', source: 'ind-sma50', target: 'cond-cross-below', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-sma200-cross-below-b', source: 'ind-sma200', target: 'cond-cross-below', sourceHandle: 'value', targetHandle: 'b' },
    // Conditions -> Signals
    { id: 'e-cross-above-buy', source: 'cond-cross-above', target: 'sig-buy', sourceHandle: 'signal', targetHandle: 'signal' },
    { id: 'e-cross-below-sell', source: 'cond-cross-below', target: 'sig-sell', sourceHandle: 'signal', targetHandle: 'signal' },
    // Signals -> Output
    { id: 'e-buy-output', source: 'sig-buy', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
    { id: 'e-sell-output', source: 'sig-sell', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
  ],
};

/**
 * RSI Mean Reversion strategy: BTC, RSI(14) < 30 to buy, RSI(14) > 70 to sell.
 */
export const rsiMeanReversionTemplate: StrategyTemplate = {
  name: 'RSI Mean Reversion',
  nodes: [
    // DataSource: BTC
    {
      id: 'ds-btc',
      type: 'datasource',
      position: { x: 50, y: 200 },
      data: {
        label: 'BTC Daily',
        category: 'datasource',
        status: 'idle',
        symbol: 'BTC',
        timeframe: '1D',
        dateFrom: '2020-01-01',
        dateTo: '2024-01-01',
      } as DataSourceNodeData,
    },
    // Indicator: RSI(14)
    {
      id: 'ind-rsi',
      type: 'indicator',
      position: { x: 350, y: 200 },
      data: {
        label: 'RSI (14)',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'RSI',
        params: { period: 14 },
      } as IndicatorNodeData,
    },
    // Condition: RSI < 30 (oversold -> buy)
    {
      id: 'cond-oversold',
      type: 'condition',
      position: { x: 650, y: 100 },
      data: {
        label: 'RSI < 30',
        category: 'condition',
        status: 'idle',
        operator: 'less_than',
        constantValue: 30,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Condition: RSI > 70 (overbought -> sell)
    {
      id: 'cond-overbought',
      type: 'condition',
      position: { x: 650, y: 300 },
      data: {
        label: 'RSI > 70',
        category: 'condition',
        status: 'idle',
        operator: 'greater_than',
        constantValue: 70,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Signal: Buy
    {
      id: 'sig-buy',
      type: 'signal',
      position: { x: 950, y: 100 },
      data: {
        label: 'Buy Signal',
        category: 'signal',
        status: 'idle',
        direction: 'buy',
        sizing: 1,
        signalLabel: 'RSI Oversold Buy',
      } as SignalNodeData,
    },
    // Signal: Sell
    {
      id: 'sig-sell',
      type: 'signal',
      position: { x: 950, y: 300 },
      data: {
        label: 'Sell Signal',
        category: 'signal',
        status: 'idle',
        direction: 'sell',
        sizing: 1,
        signalLabel: 'RSI Overbought Sell',
      } as SignalNodeData,
    },
    // Output
    {
      id: 'output-1',
      type: 'output',
      position: { x: 1250, y: 200 },
      data: {
        label: 'Output',
        category: 'output',
        status: 'idle',
        strategyName: 'RSI Mean Reversion',
        initialCapital: 100000,
      } as OutputNodeData,
    },
  ],
  edges: [
    // DataSource -> RSI
    { id: 'e-ds-rsi', source: 'ds-btc', target: 'ind-rsi', sourceHandle: 'candles', targetHandle: 'candles' },
    // RSI -> both conditions
    { id: 'e-rsi-oversold', source: 'ind-rsi', target: 'cond-oversold', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-rsi-overbought', source: 'ind-rsi', target: 'cond-overbought', sourceHandle: 'value', targetHandle: 'a' },
    // Conditions -> Signals
    { id: 'e-oversold-buy', source: 'cond-oversold', target: 'sig-buy', sourceHandle: 'signal', targetHandle: 'signal' },
    { id: 'e-overbought-sell', source: 'cond-overbought', target: 'sig-sell', sourceHandle: 'signal', targetHandle: 'signal' },
    // Signals -> Output
    { id: 'e-buy-output', source: 'sig-buy', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
    { id: 'e-sell-output', source: 'sig-sell', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
  ],
};

/**
 * MACD Momentum strategy: ETH + NVDA, MACD histogram crosses zero.
 * Uses a combiner (OR) to trigger on either symbol's signal.
 */
export const macdMomentumTemplate: StrategyTemplate = {
  name: 'MACD Momentum',
  nodes: [
    // DataSource: ETH
    {
      id: 'ds-eth',
      type: 'datasource',
      position: { x: 50, y: 100 },
      data: {
        label: 'ETH Daily',
        category: 'datasource',
        status: 'idle',
        symbol: 'ETH',
        timeframe: '1D',
        dateFrom: '2020-01-01',
        dateTo: '2024-01-01',
      } as DataSourceNodeData,
    },
    // DataSource: NVDA
    {
      id: 'ds-nvda',
      type: 'datasource',
      position: { x: 50, y: 400 },
      data: {
        label: 'NVDA Daily',
        category: 'datasource',
        status: 'idle',
        symbol: 'NVDA',
        timeframe: '1D',
        dateFrom: '2020-01-01',
        dateTo: '2024-01-01',
      } as DataSourceNodeData,
    },
    // Indicator: MACD for ETH
    {
      id: 'ind-macd-eth',
      type: 'indicator',
      position: { x: 350, y: 100 },
      data: {
        label: 'MACD (ETH)',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'MACD',
        params: { fast: 12, slow: 26, signal: 9 },
      } as IndicatorNodeData,
    },
    // Indicator: MACD for NVDA
    {
      id: 'ind-macd-nvda',
      type: 'indicator',
      position: { x: 350, y: 400 },
      data: {
        label: 'MACD (NVDA)',
        category: 'indicator',
        status: 'idle',
        indicatorType: 'MACD',
        params: { fast: 12, slow: 26, signal: 9 },
      } as IndicatorNodeData,
    },
    // Condition: ETH MACD histogram crosses above 0 (buy)
    {
      id: 'cond-eth-cross-up',
      type: 'condition',
      position: { x: 650, y: 50 },
      data: {
        label: 'Hist > 0 (ETH)',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_above',
        constantValue: 0,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Condition: NVDA MACD histogram crosses above 0 (buy)
    {
      id: 'cond-nvda-cross-up',
      type: 'condition',
      position: { x: 650, y: 200 },
      data: {
        label: 'Hist > 0 (NVDA)',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_above',
        constantValue: 0,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Condition: ETH MACD histogram crosses below 0 (sell)
    {
      id: 'cond-eth-cross-down',
      type: 'condition',
      position: { x: 650, y: 350 },
      data: {
        label: 'Hist < 0 (ETH)',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_below',
        constantValue: 0,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Condition: NVDA MACD histogram crosses below 0 (sell)
    {
      id: 'cond-nvda-cross-down',
      type: 'condition',
      position: { x: 650, y: 500 },
      data: {
        label: 'Hist < 0 (NVDA)',
        category: 'condition',
        status: 'idle',
        operator: 'crosses_below',
        constantValue: 0,
        useConstant: true,
      } as ConditionNodeData,
    },
    // Combiner: OR for buy signals
    {
      id: 'comb-buy-or',
      type: 'combiner',
      position: { x: 950, y: 125 },
      data: {
        label: 'OR (Buy)',
        category: 'combiner',
        status: 'idle',
        mode: 'OR',
      } as CombinerNodeData,
    },
    // Combiner: OR for sell signals
    {
      id: 'comb-sell-or',
      type: 'combiner',
      position: { x: 950, y: 425 },
      data: {
        label: 'OR (Sell)',
        category: 'combiner',
        status: 'idle',
        mode: 'OR',
      } as CombinerNodeData,
    },
    // Signal: Buy
    {
      id: 'sig-buy',
      type: 'signal',
      position: { x: 1250, y: 125 },
      data: {
        label: 'Buy Signal',
        category: 'signal',
        status: 'idle',
        direction: 'buy',
        sizing: 1,
        signalLabel: 'MACD Bullish Cross',
      } as SignalNodeData,
    },
    // Signal: Sell
    {
      id: 'sig-sell',
      type: 'signal',
      position: { x: 1250, y: 425 },
      data: {
        label: 'Sell Signal',
        category: 'signal',
        status: 'idle',
        direction: 'sell',
        sizing: 1,
        signalLabel: 'MACD Bearish Cross',
      } as SignalNodeData,
    },
    // Output
    {
      id: 'output-1',
      type: 'output',
      position: { x: 1550, y: 275 },
      data: {
        label: 'Output',
        category: 'output',
        status: 'idle',
        strategyName: 'MACD Momentum',
        initialCapital: 100000,
      } as OutputNodeData,
    },
  ],
  edges: [
    // DataSources -> MACDs
    { id: 'e-eth-macd', source: 'ds-eth', target: 'ind-macd-eth', sourceHandle: 'candles', targetHandle: 'candles' },
    { id: 'e-nvda-macd', source: 'ds-nvda', target: 'ind-macd-nvda', sourceHandle: 'candles', targetHandle: 'candles' },
    // MACD histograms -> Conditions
    { id: 'e-macd-eth-up', source: 'ind-macd-eth', target: 'cond-eth-cross-up', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-macd-nvda-up', source: 'ind-macd-nvda', target: 'cond-nvda-cross-up', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-macd-eth-down', source: 'ind-macd-eth', target: 'cond-eth-cross-down', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e-macd-nvda-down', source: 'ind-macd-nvda', target: 'cond-nvda-cross-down', sourceHandle: 'value', targetHandle: 'a' },
    // Buy conditions -> OR combiner
    { id: 'e-eth-up-or', source: 'cond-eth-cross-up', target: 'comb-buy-or', sourceHandle: 'signal', targetHandle: 'a' },
    { id: 'e-nvda-up-or', source: 'cond-nvda-cross-up', target: 'comb-buy-or', sourceHandle: 'signal', targetHandle: 'b' },
    // Sell conditions -> OR combiner
    { id: 'e-eth-down-or', source: 'cond-eth-cross-down', target: 'comb-sell-or', sourceHandle: 'signal', targetHandle: 'a' },
    { id: 'e-nvda-down-or', source: 'cond-nvda-cross-down', target: 'comb-sell-or', sourceHandle: 'signal', targetHandle: 'b' },
    // Combiners -> Signals
    { id: 'e-or-buy', source: 'comb-buy-or', target: 'sig-buy', sourceHandle: 'signal', targetHandle: 'signal' },
    { id: 'e-or-sell', source: 'comb-sell-or', target: 'sig-sell', sourceHandle: 'signal', targetHandle: 'signal' },
    // Signals -> Output
    { id: 'e-buy-output', source: 'sig-buy', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
    { id: 'e-sell-output', source: 'sig-sell', target: 'output-1', sourceHandle: 'action', targetHandle: 'action' },
  ],
};

/** All default strategy templates */
export const defaultTemplates: StrategyTemplate[] = [
  goldenCrossTemplate,
  rsiMeanReversionTemplate,
  macdMomentumTemplate,
];
