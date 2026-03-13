'use client';

interface LoadingPulseProps {
  className?: string;
}

export function LoadingPulse({ className = 'h-[200px]' }: LoadingPulseProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-hover)] rounded-lg flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
