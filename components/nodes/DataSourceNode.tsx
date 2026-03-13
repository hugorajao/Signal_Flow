'use client';

import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import dynamic from 'next/dynamic';
import type { DataSourceNodeData, HandleDefinition } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const TVMiniChart = dynamic(
  () =>
    import('@/components/tradingview/TVMiniChart').then((m) => ({
      default: m.TVMiniChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[120px] animate-pulse bg-zinc-800 rounded" />
    ),
  }
);

const OUTPUTS: HandleDefinition[] = [
  { id: 'candles', label: 'Candles', type: 'candles', position: 'right' },
];

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

export function DataSourceNode({ id, data, selected }: NodeProps) {
  const nodeData = data as DataSourceNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const handleSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { symbol: e.target.value.toUpperCase() });
    },
    [id, updateNodeData]
  );

  const handleTimeframeChange = useCallback(
    (tf: string) => {
      updateNodeData(id, { timeframe: tf });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      category="datasource"
      title={`Data: ${nodeData.symbol}`}
      status={nodeData.status}
      selected={selected}
      inputs={[]}
      outputs={OUTPUTS}
    >
      <div className="flex flex-col gap-2">
        {/* Symbol input */}
        <input
          type="text"
          value={nodeData.symbol}
          onChange={handleSymbolChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
          placeholder="AAPL"
        />

        {/* Timeframe badges */}
        <div className="flex flex-wrap gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                nodeData.timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Mini chart */}
        <div className="h-[120px] rounded overflow-hidden">
          <TVMiniChart symbol={nodeData.symbol} />
        </div>
      </div>
    </BaseNode>
  );
}
