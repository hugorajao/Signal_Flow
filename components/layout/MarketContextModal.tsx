'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import dynamic from 'next/dynamic';
import { LoadingPulse } from '@/components/shared/LoadingPulse';

const TVStockHeatmap = dynamic(
  () => import('@/components/tradingview/TVStockHeatmap').then((m) => ({ default: m.TVStockHeatmap })),
  { ssr: false, loading: () => <LoadingPulse className="h-[500px]" /> }
);

const TVCryptoHeatmap = dynamic(
  () => import('@/components/tradingview/TVCryptoHeatmap').then((m) => ({ default: m.TVCryptoHeatmap })),
  { ssr: false, loading: () => <LoadingPulse className="h-[500px]" /> }
);

const TVMarketOverview = dynamic(
  () => import('@/components/tradingview/TVMarketOverview').then((m) => ({ default: m.TVMarketOverview })),
  { ssr: false, loading: () => <LoadingPulse className="h-[500px]" /> }
);

type MarketTab = 'stocks' | 'crypto' | 'overview';

export function MarketContextModal() {
  const { marketsModalOpen, setMarketsModalOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<MarketTab>('stocks');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMarketsModalOpen(false);
    };
    if (marketsModalOpen) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [marketsModalOpen, setMarketsModalOpen]);

  if (!marketsModalOpen) return null;

  const tabs: { id: MarketTab; label: string }[] = [
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'overview', label: 'Overview' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setMarketsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Market Context"
    >
      <div
        className="w-[90vw] h-[85vh] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Markets
            </h2>
            <div className="flex items-center gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-xs font-sans rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setMarketsModalOpen(false)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close markets modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'stocks' && <TVStockHeatmap />}
          {activeTab === 'crypto' && <TVCryptoHeatmap />}
          {activeTab === 'overview' && <TVMarketOverview />}
        </div>
      </div>
    </div>
  );
}
