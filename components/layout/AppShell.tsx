'use client';

import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { useUIStore } from '@/stores/uiStore';

interface AppShellProps {
  palette: ReactNode;
  canvas: ReactNode;
  inspector: ReactNode;
  results: ReactNode;
  modals?: ReactNode;
}

export function AppShell({ palette, canvas, inspector, results, modals }: AppShellProps) {
  const { leftPanelOpen, rightPanelOpen, bottomPanelOpen, bottomPanelHeight } = useUIStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-root">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node Palette */}
        {leftPanelOpen && (
          <div className="w-[200px] flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto panel-slide">
            {palette}
          </div>
        )}

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <div className="flex h-full">
              <div className="flex-1 overflow-hidden">
                {canvas}
              </div>

              {/* Right: Node Inspector */}
              {rightPanelOpen && (
                <div className="w-[300px] flex-shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto panel-slide">
                  {inspector}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Results Panel */}
          {bottomPanelOpen && (
            <div
              className="flex-shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden panel-slide"
              style={{ height: `${bottomPanelHeight}%` }}
            >
              {results}
            </div>
          )}
        </div>
      </div>

      <StatusBar />
      {modals}
    </div>
  );
}
