'use client';

import { useState, useMemo } from 'react';
import { Trade } from '@/engine/types';
import { formatCurrency, formatPercent, formatDate } from '@/lib/formatters';

interface TradeListProps {
  trades: Trade[];
}

type SortKey =
  | 'index'
  | 'symbol'
  | 'entryPrice'
  | 'exitPrice'
  | 'pnl'
  | 'pnlPercent'
  | 'holdingPeriod'
  | 'entryTime'
  | 'exitTime';

type SortDirection = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'right' }[] = [
  { key: 'index', label: '#', align: 'right' },
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'entryPrice', label: 'Entry Price', align: 'right' },
  { key: 'exitPrice', label: 'Exit Price', align: 'right' },
  { key: 'pnl', label: 'PnL ($)', align: 'right' },
  { key: 'pnlPercent', label: 'PnL (%)', align: 'right' },
  { key: 'holdingPeriod', label: 'Holding Period', align: 'right' },
  { key: 'entryTime', label: 'Entry Date', align: 'left' },
  { key: 'exitTime', label: 'Exit Date', align: 'left' },
];

interface IndexedTrade extends Trade {
  index: number;
}

function compareTrades(
  a: IndexedTrade,
  b: IndexedTrade,
  key: SortKey,
  direction: SortDirection
): number {
  let comparison = 0;

  switch (key) {
    case 'index':
      comparison = a.index - b.index;
      break;
    case 'symbol':
      comparison = a.symbol.localeCompare(b.symbol);
      break;
    case 'entryPrice':
      comparison = a.entryPrice - b.entryPrice;
      break;
    case 'exitPrice':
      comparison = a.exitPrice - b.exitPrice;
      break;
    case 'pnl':
      comparison = a.pnl - b.pnl;
      break;
    case 'pnlPercent':
      comparison = a.pnlPercent - b.pnlPercent;
      break;
    case 'holdingPeriod':
      comparison = a.holdingPeriod - b.holdingPeriod;
      break;
    case 'entryTime':
      comparison = a.entryTime - b.entryTime;
      break;
    case 'exitTime':
      comparison = a.exitTime - b.exitTime;
      break;
  }

  return direction === 'asc' ? comparison : -comparison;
}

export function TradeList({ trades }: TradeListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const indexedTrades: IndexedTrade[] = useMemo(
    () => trades.map((t, i) => ({ ...t, index: i + 1 })),
    [trades]
  );

  const sortedTrades = useMemo(() => {
    return [...indexedTrades].sort((a, b) =>
      compareTrades(a, b, sortKey, sortDirection)
    );
  }, [indexedTrades, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-y-auto rounded-lg border border-zinc-800" style={{ maxHeight: 400 }}>
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10 bg-zinc-900">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`cursor-pointer select-none whitespace-nowrap border-b border-zinc-800 px-3 py-2 font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300 ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTrades.map((trade) => {
            const isProfit = trade.pnl >= 0;
            const pnlColor = isProfit ? 'text-emerald-400' : 'text-red-400';

            return (
              <tr
                key={trade.index}
                className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-3 py-2 text-right font-mono text-zinc-500">
                  {trade.index}
                </td>
                <td className="px-3 py-2 text-left font-medium text-zinc-200">
                  {trade.symbol}
                </td>
                <td className="px-3 py-2 text-right font-mono text-zinc-300">
                  {formatCurrency(trade.entryPrice)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-zinc-300">
                  {formatCurrency(trade.exitPrice)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${pnlColor}`}>
                  {formatCurrency(trade.pnl)}
                </td>
                <td className={`px-3 py-2 text-right font-mono ${pnlColor}`}>
                  {formatPercent(trade.pnlPercent)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-zinc-300">
                  {trade.holdingPeriod}d
                </td>
                <td className="px-3 py-2 text-left text-zinc-400">
                  {formatDate(trade.entryTime)}
                </td>
                <td className="px-3 py-2 text-left text-zinc-400">
                  {formatDate(trade.exitTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
