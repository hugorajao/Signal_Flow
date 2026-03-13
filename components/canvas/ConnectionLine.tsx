'use client';

import { ConnectionLineComponentProps, getBezierPath } from '@xyflow/react';

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray="5 5"
        className="animated"
      />
      <circle
        cx={toX}
        cy={toY}
        r={4}
        fill="#3B82F6"
        stroke="#0A0A0B"
        strokeWidth={1.5}
      />
    </g>
  );
}
