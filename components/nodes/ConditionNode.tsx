'use client';

import { useCallback, useMemo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { ConditionNodeData, HandleDefinition, ConditionOperator } from '@/engine/types';
import { BaseNode } from './BaseNode';
import { useStrategyStore } from '@/stores/strategyStore';

const OUTPUTS: HandleDefinition[] = [
  { id: 'signal', label: 'Signal', type: 'signal', position: 'right' },
];

const ALL_INPUTS: HandleDefinition[] = [
  { id: 'valueA', label: 'Value A', type: 'value', position: 'left' },
  { id: 'valueB', label: 'Value B', type: 'value', position: 'left' },
];

const SINGLE_INPUT: HandleDefinition[] = [
  { id: 'valueA', label: 'Value A', type: 'value', position: 'left' },
];

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  crosses_above: 'Crosses Above',
  crosses_below: 'Crosses Below',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  between: 'Between',
  equals: 'Equals',
};

const ALL_OPERATORS: ConditionOperator[] = [
  'crosses_above',
  'crosses_below',
  'greater_than',
  'less_than',
  'between',
  'equals',
];

export function ConditionNode({ id, data, selected }: NodeProps) {
  const nodeData = data as ConditionNodeData;
  const updateNodeData = useStrategyStore((s) => s.updateNodeData);

  const inputs = useMemo(
    () => (nodeData.useConstant ? SINGLE_INPUT : ALL_INPUTS),
    [nodeData.useConstant]
  );

  const handleOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateNodeData(id, { operator: e.target.value as ConditionOperator });
    },
    [id, updateNodeData]
  );

  const handleUseConstantToggle = useCallback(() => {
    updateNodeData(id, { useConstant: !nodeData.useConstant });
  }, [id, nodeData.useConstant, updateNodeData]);

  const handleConstantChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        updateNodeData(id, { constantValue: numValue });
      }
    },
    [id, updateNodeData]
  );

  return (
    <BaseNode
      category="condition"
      title="Condition"
      status={nodeData.status}
      selected={selected}
      inputs={inputs}
      outputs={OUTPUTS}
    >
      <div className="flex flex-col gap-2">
        {/* Operator selector */}
        <select
          value={nodeData.operator}
          onChange={handleOperatorChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
        >
          {ALL_OPERATORS.map((op) => (
            <option key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>

        {/* Use constant toggle */}
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-zinc-500">Use Constant</label>
          <button
            onClick={handleUseConstantToggle}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              nodeData.useConstant ? 'bg-purple-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                nodeData.useConstant ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Constant value input */}
        {nodeData.useConstant && (
          <div className="flex items-center justify-between gap-2">
            <label className="text-[10px] text-zinc-500">Value</label>
            <input
              type="number"
              value={nodeData.constantValue ?? 0}
              onChange={handleConstantChange}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 font-mono text-right focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>
    </BaseNode>
  );
}
