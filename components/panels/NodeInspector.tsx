'use client';

import { useStrategyStore } from '@/stores/strategyStore';
import { Select } from '@/components/shared/Select';
import { Slider } from '@/components/shared/Slider';
import {
  IndicatorType,
  ConditionOperator,
  CombinerMode,
  FilterType,
} from '@/engine/types';
import { TIMEFRAMES, INDICATOR_DEFAULTS } from '@/lib/constants';
import dynamic from 'next/dynamic';

const TVAdvancedChart = dynamic(
  () => import('@/components/tradingview/TVAdvancedChart').then((m) => ({ default: m.TVAdvancedChart })),
  { ssr: false, loading: () => <div className="h-[250px] animate-pulse bg-zinc-800 rounded" /> }
);

const TVTechnicalAnalysis = dynamic(
  () => import('@/components/tradingview/TVTechnicalAnalysis').then((m) => ({ default: m.TVTechnicalAnalysis })),
  { ssr: false, loading: () => <div className="h-[250px] animate-pulse bg-zinc-800 rounded" /> }
);

const INDICATOR_OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: 'SMA', label: 'Simple Moving Average' },
  { value: 'EMA', label: 'Exponential Moving Average' },
  { value: 'RSI', label: 'Relative Strength Index' },
  { value: 'MACD', label: 'MACD' },
  { value: 'BB', label: 'Bollinger Bands' },
  { value: 'ATR', label: 'Average True Range' },
  { value: 'VWAP', label: 'VWAP' },
];

const CONDITION_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'crosses_above', label: 'Crosses Above' },
  { value: 'crosses_below', label: 'Crosses Below' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'equals', label: 'Equals' },
];

const COMBINER_OPTIONS: { value: CombinerMode; label: string }[] = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
  { value: 'NOT', label: 'NOT' },
  { value: 'NAND', label: 'NAND' },
  { value: 'XOR', label: 'XOR' },
];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'time', label: 'Time Filter' },
  { value: 'cooldown', label: 'Cooldown' },
  { value: 'volume', label: 'Volume Filter' },
];

export function NodeInspector() {
  const { nodes, selectedNodeId, updateNodeData } = useStrategyStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="p-3 h-full flex items-center justify-center">
        <p className="text-sm text-[var(--text-tertiary)] text-center">
          Select a node to inspect its properties
        </p>
      </div>
    );
  }

  const data = selectedNode.data as Record<string, unknown>;
  const category = data.category as string;
  const nodeId = selectedNode.id;

  const update = (updates: Record<string, unknown>) => {
    updateNodeData(nodeId, updates);
  };

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-y-auto">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-sans font-medium text-[var(--text-primary)]">
          {data.label as string}
        </h3>
      </div>

      {/* DataSource Inspector */}
      {category === 'datasource' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">Symbol</label>
            <input
              type="text"
              value={(data.symbol as string) || ''}
              onChange={(e) => update({ symbol: e.target.value })}
              className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="EQUITY:SPY"
            />
          </div>

          <Select
            label="Timeframe"
            value={(data.timeframe as string) || '1d'}
            onChange={(v) => update({ timeframe: v })}
            options={TIMEFRAMES}
          />

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">From</label>
              <input
                type="date"
                value={(data.dateFrom as string) || ''}
                onChange={(e) => update({ dateFrom: e.target.value })}
                className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">To</label>
              <input
                type="date"
                value={(data.dateTo as string) || ''}
                onChange={(e) => update({ dateTo: e.target.value })}
                className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* TV Widgets for DataSource */}
          <div className="mt-2 flex flex-col gap-2">
            <TVAdvancedChart
              symbol={(data.symbol as string) || 'EQUITY:SPY'}
              height={250}
            />
            <TVTechnicalAnalysis
              symbol={(data.symbol as string) || 'EQUITY:SPY'}
            />
          </div>
        </>
      )}

      {/* Indicator Inspector */}
      {category === 'indicator' && (
        <>
          <Select
            label="Indicator"
            value={(data.indicatorType as string) || 'SMA'}
            onChange={(v) => {
              const defaults = INDICATOR_DEFAULTS[v as IndicatorType] || { period: 20 };
              update({ indicatorType: v, params: defaults, label: v });
            }}
            options={INDICATOR_OPTIONS}
          />

          {renderIndicatorParams(
            data.indicatorType as IndicatorType,
            (data.params as Record<string, number>) || {},
            (params: Record<string, number>) => update({ params })
          )}
        </>
      )}

      {/* Condition Inspector */}
      {category === 'condition' && (
        <>
          <Select
            label="Operator"
            value={(data.operator as string) || 'crosses_above'}
            onChange={(v) => update({ operator: v })}
            options={CONDITION_OPTIONS}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(data.useConstant as boolean) || false}
              onChange={(e) => update({ useConstant: e.target.checked })}
              className="rounded border-zinc-600"
              id="use-constant"
            />
            <label htmlFor="use-constant" className="text-xs font-sans text-[var(--text-secondary)]">
              Compare with constant
            </label>
          </div>

          {(data.useConstant as boolean) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">Value</label>
              <input
                type="number"
                value={(data.constantValue as number) || 0}
                onChange={(e) => update({ constantValue: Number(e.target.value) })}
                className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
        </>
      )}

      {/* Combiner Inspector */}
      {category === 'combiner' && (
        <Select
          label="Logic Mode"
          value={(data.mode as string) || 'AND'}
          onChange={(v) => update({ mode: v })}
          options={COMBINER_OPTIONS}
        />
      )}

      {/* Signal Inspector */}
      {category === 'signal' && (
        <>
          <Select
            label="Direction"
            value={(data.direction as string) || 'buy'}
            onChange={(v) => update({ direction: v, label: v === 'buy' ? 'Buy Signal' : 'Sell Signal' })}
            options={[
              { value: 'buy', label: 'BUY' },
              { value: 'sell', label: 'SELL' },
            ]}
          />

          <Slider
            label="Position Size"
            value={(data.sizing as number) || 100}
            onChange={(v) => update({ sizing: v })}
            min={1}
            max={100}
            suffix="%"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">Label</label>
            <input
              type="text"
              value={(data.signalLabel as string) || ''}
              onChange={(e) => update({ signalLabel: e.target.value })}
              className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-sm font-sans text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </>
      )}

      {/* Filter Inspector */}
      {category === 'filter' && (
        <>
          <Select
            label="Filter Type"
            value={(data.filterType as string) || 'cooldown'}
            onChange={(v) => update({ filterType: v })}
            options={FILTER_OPTIONS}
          />

          {renderFilterParams(
            data.filterType as FilterType,
            (data.params as Record<string, number>) || {},
            (params: Record<string, number>) => update({ params })
          )}
        </>
      )}

      {/* Output Inspector */}
      {category === 'output' && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">Strategy Name</label>
            <input
              type="text"
              value={(data.strategyName as string) || ''}
              onChange={(e) => update({ strategyName: e.target.value })}
              className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-sm font-sans text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-sans text-[var(--text-tertiary)] uppercase tracking-wide">Initial Capital</label>
            <input
              type="number"
              value={(data.initialCapital as number) || 10000}
              onChange={(e) => update({ initialCapital: Number(e.target.value) })}
              className="bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </>
      )}
    </div>
  );
}

function renderIndicatorParams(
  type: IndicatorType,
  params: Record<string, number>,
  onChange: (params: Record<string, number>) => void
) {
  switch (type) {
    case 'SMA':
    case 'EMA':
      return (
        <Slider
          label="Period"
          value={params.period || 20}
          onChange={(v) => onChange({ ...params, period: v })}
          min={2}
          max={200}
        />
      );
    case 'RSI':
      return (
        <Slider
          label="Period"
          value={params.period || 14}
          onChange={(v) => onChange({ ...params, period: v })}
          min={2}
          max={50}
        />
      );
    case 'MACD':
      return (
        <div className="flex flex-col gap-2">
          <Slider label="Fast" value={params.fast || 12} onChange={(v) => onChange({ ...params, fast: v })} min={2} max={50} />
          <Slider label="Slow" value={params.slow || 26} onChange={(v) => onChange({ ...params, slow: v })} min={2} max={100} />
          <Slider label="Signal" value={params.signal || 9} onChange={(v) => onChange({ ...params, signal: v })} min={2} max={50} />
        </div>
      );
    case 'BB':
      return (
        <div className="flex flex-col gap-2">
          <Slider label="Period" value={params.period || 20} onChange={(v) => onChange({ ...params, period: v })} min={2} max={100} />
          <Slider label="Std Dev" value={params.stdDev || 2} onChange={(v) => onChange({ ...params, stdDev: v })} min={1} max={4} step={0.5} />
        </div>
      );
    case 'ATR':
      return (
        <Slider
          label="Period"
          value={params.period || 14}
          onChange={(v) => onChange({ ...params, period: v })}
          min={2}
          max={50}
        />
      );
    case 'VWAP':
      return (
        <p className="text-xs text-[var(--text-tertiary)]">No parameters — resets daily</p>
      );
    default:
      return null;
  }
}

function renderFilterParams(
  type: FilterType,
  params: Record<string, number>,
  onChange: (params: Record<string, number>) => void
) {
  switch (type) {
    case 'cooldown':
      return (
        <Slider
          label="Cooldown Bars"
          value={params.bars || 5}
          onChange={(v) => onChange({ ...params, bars: v })}
          min={1}
          max={50}
        />
      );
    case 'time':
      return (
        <div className="flex flex-col gap-2">
          <Slider label="Start Hour" value={params.startHour || 9} onChange={(v) => onChange({ ...params, startHour: v })} min={0} max={23} />
          <Slider label="End Hour" value={params.endHour || 16} onChange={(v) => onChange({ ...params, endHour: v })} min={0} max={23} />
        </div>
      );
    case 'volume':
      return (
        <Slider
          label="Volume Multiplier"
          value={params.multiplier || 1.5}
          onChange={(v) => onChange({ ...params, multiplier: v })}
          min={0.5}
          max={5}
          step={0.1}
          suffix="x"
        />
      );
    default:
      return null;
  }
}
