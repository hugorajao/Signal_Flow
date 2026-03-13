'use client';

import { Handle, Position } from '@xyflow/react';
import { NODE_COLORS } from '@/lib/colors';
import type { NodeCategory, HandleDefinition } from '@/engine/types';

interface BaseNodeProps {
  category: NodeCategory;
  title: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  selected?: boolean;
  inputs: HandleDefinition[];
  outputs: HandleDefinition[];
  children: React.ReactNode;
  color?: string;
}

const STATUS_COLORS: Record<BaseNodeProps['status'], string> = {
  idle: '#52525B',
  loading: '#F59E0B',
  ready: '#22C55E',
  error: '#EF4444',
};

function getHandleTopOffset(index: number, total: number): string {
  if (total === 1) return '50%';
  const spacing = 100 / (total + 1);
  return `${spacing * (index + 1)}%`;
}

export function BaseNode({
  category,
  title,
  status,
  selected = false,
  inputs,
  outputs,
  children,
  color,
}: BaseNodeProps) {
  const accentColor = color ?? NODE_COLORS[category] ?? '#52525B';

  return (
    <div
      className={`node-appear relative min-w-[220px] max-w-[320px] rounded-lg shadow-2xl ${
        selected ? 'ring-2 ring-blue-500/50' : ''
      }`}
      style={{
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(63, 63, 70, 0.5)',
        borderTopWidth: '3px',
        borderTopColor: accentColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/50">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        <span className="text-xs font-medium text-zinc-200 truncate">
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="p-3">{children}</div>

      {/* Input Handles (left) */}
      {inputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={handle.id}
            style={{
              top: getHandleTopOffset(index, inputs.length),
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: accentColor,
              border: '2px solid #18181B',
            }}
          />
          <span
            className="absolute text-[10px] text-zinc-500 pointer-events-none"
            style={{
              left: 16,
              top: `calc(${getHandleTopOffset(index, inputs.length)} - 6px)`,
            }}
          >
            {handle.label}
          </span>
        </div>
      ))}

      {/* Output Handles (right) */}
      {outputs.map((handle, index) => (
        <div key={handle.id}>
          <Handle
            type="source"
            position={Position.Right}
            id={handle.id}
            style={{
              top: getHandleTopOffset(index, outputs.length),
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: accentColor,
              border: '2px solid #18181B',
            }}
          />
          <span
            className="absolute text-[10px] text-zinc-500 pointer-events-none"
            style={{
              right: 16,
              top: `calc(${getHandleTopOffset(index, outputs.length)} - 6px)`,
              textAlign: 'right',
            }}
          >
            {handle.label}
          </span>
        </div>
      ))}
    </div>
  );
}
