export const NODE_COLORS: Record<string, string> = {
  datasource: '#00D4FF',
  indicator: '#FFB800',
  condition: '#A855F7',
  combiner: '#10B981',
  signal_buy: '#22C55E',
  signal_sell: '#EF4444',
  filter: '#94A3B8',
  output: '#F8FAFC',
};

export const CHART_COLORS = {
  equity: '#3B82F6',
  benchmark: '#52525B',
  drawdown: '#EF444480',
  grid: '#1E1E22',
  positive: '#22C55E',
  negative: '#EF4444',
  neutral: '#3B82F6',
  amber: '#F59E0B',
  violet: '#A855F7',
};

export const COMPARISON_PALETTE = ['#3B82F6', '#F59E0B', '#A855F7', '#10B981'];

// Monthly returns heatmap color scale
export function getReturnColor(value: number): string {
  if (value > 10) return '#22C55E';
  if (value > 5) return '#22C55ECC';
  if (value > 2) return '#22C55E80';
  if (value > 0) return '#22C55E40';
  if (value === 0) return '#27272A';
  if (value > -2) return '#EF444440';
  if (value > -5) return '#EF444480';
  if (value > -10) return '#EF4444CC';
  return '#EF4444';
}
