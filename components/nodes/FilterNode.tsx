'use client';

import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { FilterNodeData, HandleDefinition, FilterType } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const INPUTS: HandleDefinition[] = [
  { id: 'signal', label: 'Signal', type: 'signal', position: 'left' },
];

const OUTPUTS: HandleDefinition[] = [
  { id: 'filtered', label: 'Filtered', type: 'signal', position: 'right' },
];

const ALL_FILTER_TYPES: FilterType[] = ['time', 'cooldown', 'volume'];

const FILTER_LABELS: Record<FilterType, string> = {
  time: 'Time Filter',
  cooldown: 'Cooldown',
  volume: 'Volume Filter',
};

const FILTER_DESCRIPTIONS: Record<FilterType, string> = {
  time: 'Only allow signals during specific hours',
  cooldown: 'Min bars between signals',
  volume: 'Min volume threshold',
};

const DEFAULT_FILTER_PARAMS: Record<FilterType, Record<string, number>> = {
  time: { startHour: 9, endHour: 16 },
  cooldown: { bars: 5 },
  volume: { minVolume: 1000000 },
};

export function FilterNode({ id, data, selected }: NodeProps) {
  const nodeData = data as FilterNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const handleFilterTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as FilterType;
      updateNodeData(id, {
        filterType: newType,
        params: { ...DEFAULT_FILTER_PARAMS[newType] },
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
      category="filter"
      title={FILTER_LABELS[nodeData.filterType]}
      status={nodeData.status}
      selected={selected}
      inputs={INPUTS}
      outputs={OUTPUTS}
    >
      <div className="flex flex-col gap-2">
        {/* Filter type selector */}
        <select
          value={nodeData.filterType}
          onChange={handleFilterTypeChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
        >
          {ALL_FILTER_TYPES.map((ft) => (
            <option key={ft} value={ft}>
              {FILTER_LABELS[ft]}
            </option>
          ))}
        </select>

        {/* Description */}
        <p className="text-[10px] text-zinc-500">
          {FILTER_DESCRIPTIONS[nodeData.filterType]}
        </p>

        {/* Parameters */}
        <div className="flex flex-col gap-1">
          {Object.entries(nodeData.params).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-[10px] text-zinc-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleParamChange(key, e.target.value)}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 font-mono text-right focus:outline-none focus:border-zinc-500"
              />
            </div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}
