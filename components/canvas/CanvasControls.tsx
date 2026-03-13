'use client';

import { Controls, MiniMap, Background, BackgroundVariant } from '@xyflow/react';

export function CanvasControls() {
  return (
    <>
      <Controls
        showInteractive={false}
        className="!border-[var(--border-subtle)] !rounded-lg !overflow-hidden"
      />
      <MiniMap
        nodeColor={(node) => {
          const colors: Record<string, string> = {
            datasource: '#00D4FF',
            indicator: '#FFB800',
            condition: '#A855F7',
            combiner: '#10B981',
            signal: '#22C55E',
            filter: '#94A3B8',
            output: '#F8FAFC',
          };
          return colors[node.type || ''] || '#3F3F46';
        }}
        maskColor="rgba(10, 10, 11, 0.8)"
        className="!bg-[var(--bg-surface)] !border-[var(--border-subtle)]"
        pannable
        zoomable
      />
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#1E1E22"
      />
    </>
  );
}
