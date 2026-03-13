'use client';

import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { SignalNodeData, HandleDefinition } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { NODE_COLORS } from '@/lib/colors';
import { useStrategyStore } from '@/stores/strategyStore';

const INPUTS: HandleDefinition[] = [
  { id: 'trigger', label: 'Trigger', type: 'signal', position: 'left' },
];

const OUTPUTS: HandleDefinition[] = [
  { id: 'action', label: 'Action', type: 'action', position: 'right' },
];

export function SignalNode({ id, data, selected }: NodeProps) {
  const nodeData = data as SignalNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const isBuy = nodeData.direction === 'buy';
  const color = isBuy ? NODE_COLORS.signal_buy : NODE_COLORS.signal_sell;

  const handleDirectionToggle = useCallback(() => {
    const newDirection = isBuy ? 'sell' : 'buy';
    updateNodeData(id, {
      direction: newDirection,
      signalLabel: newDirection.toUpperCase(),
    });
  }, [id, isBuy, updateNodeData]);

  const handleSizingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        updateNodeData(id, { sizing: numValue / 100 });
      }
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      category="signal"
      title={`${nodeData.direction.toUpperCase()} Signal`}
      status={nodeData.status}
      selected={selected}
      inputs={INPUTS}
      outputs={OUTPUTS}
      color={color}
    >
      <div className="flex flex-col gap-2">
        {/* Direction badge */}
        <button
          onClick={handleDirectionToggle}
          className="w-full py-1.5 rounded text-xs font-bold tracking-wider transition-colors"
          style={{
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}60`,
          }}
        >
          {nodeData.direction.toUpperCase()}
        </button>

        {/* Sizing */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] text-zinc-500">Size %</label>
          <input
            type="number"
            value={Math.round(nodeData.sizing * 100)}
            onChange={handleSizingChange}
            min={0}
            max={100}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 font-mono text-right focus:outline-none"
            style={{ borderColor: `${color}40` }}
          />
        </div>
      </div>
    </BaseNode>
  );
}
