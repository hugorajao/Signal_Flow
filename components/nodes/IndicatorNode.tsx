'use client';

import { useCallback, useMemo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { IndicatorNodeData, HandleDefinition, IndicatorType } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const INPUTS: HandleDefinition[] = [
  { id: 'candles', label: 'Candles', type: 'candles', position: 'left' },
];

const DEFAULT_OUTPUTS: HandleDefinition[] = [
  { id: 'value', label: 'Value', type: 'value', position: 'right' },
];

const MACD_OUTPUTS: HandleDefinition[] = [
  { id: 'value', label: 'MACD', type: 'value', position: 'right' },
  { id: 'signalLine', label: 'Signal', type: 'value', position: 'right' },
  { id: 'histogram', label: 'Histogram', type: 'value', position: 'right' },
];

const BB_OUTPUTS: HandleDefinition[] = [
  { id: 'upper', label: 'Upper', type: 'value', position: 'right' },
  { id: 'middle', label: 'Middle', type: 'value', position: 'right' },
  { id: 'lower', label: 'Lower', type: 'value', position: 'right' },
];

function getOutputs(indicatorType: IndicatorType): HandleDefinition[] {
  switch (indicatorType) {
    case 'MACD':
      return MACD_OUTPUTS;
    case 'BB':
      return BB_OUTPUTS;
    default:
      return DEFAULT_OUTPUTS;
  }
}

const INDICATOR_LABELS: Record<IndicatorType, string> = {
  SMA: 'Simple Moving Average',
  EMA: 'Exponential Moving Average',
  RSI: 'Relative Strength Index',
  MACD: 'MACD',
  BB: 'Bollinger Bands',
  ATR: 'Average True Range',
  VWAP: 'Volume Weighted Avg Price',
};

const DEFAULT_PARAMS: Record<IndicatorType, Record<string, number>> = {
  SMA: { period: 20 },
  EMA: { period: 12 },
  RSI: { period: 14 },
  MACD: { fast: 12, slow: 26, signal: 9 },
  BB: { period: 20, stdDev: 2 },
  ATR: { period: 14 },
  VWAP: {},
};

const ALL_INDICATORS: IndicatorType[] = ['SMA', 'EMA', 'RSI', 'MACD', 'BB', 'ATR', 'VWAP'];

export function IndicatorNode({ id, data, selected }: NodeProps) {
  const nodeData = data as IndicatorNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const outputs = useMemo(
    () => getOutputs(nodeData.indicatorType),
    [nodeData.indicatorType]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as IndicatorType;
      updateNodeData(id, {
        indicatorType: newType,
        params: { ...DEFAULT_PARAMS[newType] },
        label: newType,
      });
    },
    [id, updateNodeData]
  );

  const handleParamChange = useCallback(
    (key: string, value: string) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateNodeData(id, {
          params: { ...nodeData.params, [key]: numValue },
        });
      }
    },
    [id, nodeData.params, updateNodeData]
  );

  return (
    <BaseNode
      category="indicator"
      title={`${nodeData.indicatorType} Indicator`}
      status={nodeData.status}
      selected={selected}
      inputs={INPUTS}
      outputs={outputs}
    >
      <div className="flex flex-col gap-2">
        {/* Indicator type selector */}
        <select
          value={nodeData.indicatorType}
          onChange={handleTypeChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
        >
          {ALL_INDICATORS.map((ind) => (
            <option key={ind} value={ind}>
              {ind} - {INDICATOR_LABELS[ind]}
            </option>
          ))}
        </select>

        {/* Parameters */}
        <div className="flex flex-col gap-1">
          {Object.entries(nodeData.params).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 capitalize">
                {key}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 font-mono text-right focus:outline-none focus:border-amber-500"
              />
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}
