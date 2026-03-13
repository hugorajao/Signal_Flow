'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface UseKeyboardShortcutsOptions {
  onRunBacktest: () => void;
  onSaveStrategy: () => void;
}

export function useKeyboardShortcuts({
  onRunBacktest,
  onSaveStrategy,
}: UseKeyboardShortcutsOptions) {
  const { setMarketsModalOpen, marketsModalOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + R: Run backtest
      if (isMod && e.key === 'r') {
        e.preventDefault();
        onRunBacktest();
        return;
      }

      // Cmd/Ctrl + S: Save strategy
      if (isMod && e.key === 's') {
        e.preventDefault();
        onSaveStrategy();
        return;
      }

      // F: Fit view (handled by React Flow)
      // M: Toggle markets modal
      if (e.key === 'm' && !isMod && !isInputFocused()) {
        e.preventDefault();
        setMarketsModalOpen(!marketsModalOpen);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRunBacktest, onSaveStrategy, setMarketsModalOpen, marketsModalOpen]);
}

function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}
