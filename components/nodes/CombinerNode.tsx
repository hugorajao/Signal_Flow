'use client';

import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { CombinerNodeData, HandleDefinition, CombinerMode } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const INPUTS: HandleDefinition[] = [
  { id: 'signalA', label: 'Signal A', type: 'signal', position: 'left' },
  { id: 'signalB', label: 'Signal B', type: 'signal', position: 'left' },
];

const OUTPUTS: HandleDefinition[] = [
  { id: 'combined', label: 'Combined', type: 'signal', position: 'right' },
];

const ALL_MODES: CombinerMode[] = ['AND', 'OR', 'NOT', 'NAND', 'XOR'];

const MODE_ICONS: Record<CombinerMode, string> = {
  AND: '&',
  OR: '|',
  NOT: '!',
  NAND: '!&',
  XOR: '^',
};

export function CombinerNode({ id, data, selected }: NodeProps) {
  const nodeData = data as CombinerNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const handleModeChange = useCallback(
    (mode: CombinerMode) => {
      updateNodeData(id, { mode });
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      category="combiner"
      title="Logic Gate"
      status={nodeData.status}
      selected={selected}
      inputs={INPUTS}
      outputs={OUTPUTS}
    >
      <div className="flex flex-col gap-2 items-center">
        {/* Large gate icon */}
        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-lg font-mono font-bold text-emerald-400">
            {MODE_ICONS[nodeData.mode]}
          </span>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1">
          {ALL_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                nodeData.mode === mode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}
