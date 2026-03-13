'use client';

import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { OutputNodeData, HandleDefinition } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const INPUTS: HandleDefinition[] = [
  { id: 'buySignal', label: 'Buy Signal', type: 'action', position: 'left' },
  { id: 'sellSignal', label: 'Sell Signal', type: 'action', position: 'left' },
];

export function OutputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as OutputNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { strategyName: e.target.value });
    },
    [id, updateNodeData]
  );

  const handleCapitalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue) && numValue > 0) {
        updateNodeData(id, { initialCapital: numValue });
      }
    },
    [id, updateNodeData]
  );

  const handleRun = useCallback(() => {
    updateNodeData(id, { status: 'loading' });
    // The actual run logic is handled by the engine orchestrator
  }, [id, updateNodeData]);

  return (
    <BaseNode
      category="output"
      title="Strategy Output"
      status={nodeData.status}
      selected={selected}
      inputs={INPUTS}
      outputs={[]}
    >
      <div className="flex flex-col gap-2">
        {/* Strategy name */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500">Strategy Name</label>
          <input
            type="text"
            value={nodeData.strategyName}
            onChange={handleNameChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
            placeholder="My Strategy"
          />
        </div>

        {/* Initial capital */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] text-zinc-500">Capital $</label>
          <input
            type="number"
            value={nodeData.initialCapital}
            onChange={handleCapitalChange}
            className="w-24 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 font-mono text-right focus:outline-none focus:border-zinc-400"
          />
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={nodeData.status === 'loading'}
          className={`w-full py-2 rounded text-xs font-bold tracking-wider transition-all ${
            nodeData.status === 'loading'
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-[0.98]'
          }`}
        >
          {nodeData.status === 'loading' ? 'RUNNING...' : 'RUN BACKTEST'}
        </button>

        {/* Last result summary */}
        {nodeData.lastResult && (
          <div className="flex items-center justify-between bg-zinc-800/50 rounded px-2 py-1.5 border border-zinc-700/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500">Return</span>
              <span
                className={`text-xs font-mono font-semibold ${
                  nodeData.lastResult.totalReturn >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {nodeData.lastResult.totalReturn >= 0 ? '+' : ''}
                {(nodeData.lastResult.totalReturn * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500">Sharpe</span>
              <span className="text-xs font-mono font-semibold text-zinc-200">
                {nodeData.lastResult.sharpe.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
