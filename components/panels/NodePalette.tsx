'use client';

import { useCallback } from 'react';
import {
  Database,
  TrendingUp,
  GitCompare,
  Merge,
  ArrowRightCircle,
  Filter,
  BarChart3,
} from 'lucide-react';
import { NODE_COLORS } from '@/lib/colors';
import type { NodeCategory } from '@/engine/types';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon: React.ReactNode;
}

interface PaletteGroup {
  title: string;
  items: PaletteItem[];
}

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    title: 'Data',
    items: [
      {
        type: 'datasource',
        label: 'Data Source',
        description: 'Price & volume data feed',
        category: 'datasource',
        icon: <Database size={14} />,
      },
    ],
  },
  {
    title: 'Indicators',
    items: [
      {
        type: 'indicator',
        label: 'Indicator',
        description: 'SMA, EMA, RSI, MACD, BB...',
        category: 'indicator',
        icon: <TrendingUp size={14} />,
      },
    ],
  },
  {
    title: 'Logic',
    items: [
      {
        type: 'condition',
        label: 'Condition',
        description: 'Compare values & crossovers',
        category: 'condition',
        icon: <GitCompare size={14} />,
      },
      {
        type: 'combiner',
        label: 'Combiner',
        description: 'AND, OR, NOT logic gates',
        category: 'combiner',
        icon: <Merge size={14} />,
      },
      {
        type: 'filter',
        label: 'Filter',
        description: 'Time, cooldown & volume',
        category: 'filter',
        icon: <Filter size={14} />,
      },
    ],
  },
  {
    title: 'Signals',
    items: [
      {
        type: 'signal',
        label: 'Signal',
        description: 'Buy or sell action trigger',
        category: 'signal',
        icon: <ArrowRightCircle size={14} />,
      },
    ],
  },
  {
    title: 'Output',
    items: [
      {
        type: 'output',
        label: 'Output',
        description: 'Run backtest & view results',
        category: 'output',
        icon: <BarChart3 size={14} />,
      },
    ],
  },
];

function getAccentColor(category: NodeCategory): string {
  return NODE_COLORS[category] ?? '#52525B';
}

export function NodePalette() {
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData('application/signaflow-node', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  return (
    <div className="w-[200px] h-full bg-zinc-900/95 border-r border-zinc-800 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Nodes
        </h2>
      </div>

      {/* Groups */}
      <div className="flex flex-col p-2 gap-3">
        {PALETTE_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-1">
              {group.title}
            </span>
            {group.items.map((item) => {
              const accentColor = getAccentColor(item.category);
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex items-start gap-2 px-2 py-2 rounded-md cursor-grab border border-transparent hover:border-zinc-700 hover:bg-zinc-800/50 active:cursor-grabbing transition-colors group"
                >
                  <div
                    className="mt-0.5 p-1 rounded shrink-0"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-600 leading-tight">
                      {item.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
