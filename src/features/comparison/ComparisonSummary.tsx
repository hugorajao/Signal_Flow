'use client';

import type { ComparisonData } from './hooks/useComparisonData';

interface ComparisonSummaryProps {
  data: ComparisonData;
}

function highlightNumbers(text: string): JSX.Element {
  // Match numbers with optional signs, decimal points, and % or $ symbols
  const parts = text.split(/([+\-]?\$?\d+\.?\d*%?)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^[+\-]?\$?\d+\.?\d*%?$/.test(part)) {
          return (
            <span key={i} className="text-zinc-100 font-mono">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ComparisonSummary({ data }: ComparisonSummaryProps) {
  const { summaryLines, activeSlots } = data;

  if (activeSlots.length < 2 || summaryLines.length === 0) return null;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          Summary
        </span>
      </div>
      <div className="p-3 space-y-2">
        {summaryLines.map((line, i) => (
          <p key={i} className="text-sm text-zinc-400 leading-relaxed">
            {highlightNumbers(line)}
          </p>
        ))}
      </div>
    </div>
  );
}
