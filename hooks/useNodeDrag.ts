'use client';

import { useCallback, DragEvent } from 'react';

export function useNodeDrag() {
  const onDragStart = useCallback(
    (event: DragEvent, nodeType: string) => {
      event.dataTransfer.setData('application/signaflow-node', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  return { onDragStart };
}
