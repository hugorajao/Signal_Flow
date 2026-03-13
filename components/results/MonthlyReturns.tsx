'use client';

import { useMemo } from 'react';
import { getReturnColor } from '@/lib/colors';
import { formatPercent } from '@/lib/formatters';

interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
}

interface MonthlyReturnsProps {
  monthlyReturns: MonthlyReturn[];
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function MonthlyReturns({ monthlyReturns }: MonthlyReturnsProps) {
  const { years, grid } = useMemo(() => {
    const yearSet = new Set<number>();
    const map = new Map<string, number>();

    for (const entry of monthlyReturns) {
      yearSet.add(entry.year);
      map.set(`${entry.year}-${entry.month}`, entry.return);
    }

    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);

    const gridData = sortedYears.map((year) => {
      const months: (number | null)[] = [];
      let yearTotal = 0;

      for (let m = 1; m <= 12; m++) {
        const val = map.get(`${year}-${m}`);
        if (val !== undefined) {
          months.push(val);
          yearTotal += val;
        } else {
          months.push(null);
        }
      }

      return { year, months, total: yearTotal };
    });

    return { years: sortedYears, grid: gridData };
  }, [monthlyReturns]);

  if (years.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-zinc-500">
        No monthly return data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-left font-medium uppercase tracking-wider text-zinc-500">
              Year
            </th>
            {MONTH_LABELS.map((label) => (
              <th
                key={label}
                className="px-2 py-1.5 text-center font-medium uppercase tracking-wider text-zinc-500"
              >
                {label}
              </th>
            ))}
            <th className="px-2 py-1.5 text-center font-medium uppercase tracking-wider text-zinc-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {grid.map((row) => (
            <tr key={row.year}>
              <td className="px-2 py-1 font-mono text-sm font-medium text-zinc-300">
                {row.year}
              </td>
              {row.months.map((val, monthIdx) => (
                <td key={monthIdx} className="px-1 py-1">
                  {val !== null ? (
                    <div
                      className="rounded px-1.5 py-1 text-center font-mono text-[11px]"
                      style={{
                        backgroundColor: getReturnColor(val),
                        color: Math.abs(val) > 2 ? '#FAFAFA' : '#A1A1AA',
                      }}
                    >
                      {formatPercent(val, 1)}
                    </div>
                  ) : (
                    <div className="rounded bg-zinc-900 px-1.5 py-1 text-center font-mono text-[11px] text-zinc-700">
                      --
                    </div>
                  )}
                </td>
              ))}
              <td className="px-1 py-1">
                <div
                  className="rounded px-1.5 py-1 text-center font-mono text-[11px] font-semibold"
                  style={{
                    backgroundColor: getReturnColor(row.total),
                    color: Math.abs(row.total) > 2 ? '#FAFAFA' : '#A1A1AA',
                  }}
                >
                  {formatPercent(row.total, 1)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
