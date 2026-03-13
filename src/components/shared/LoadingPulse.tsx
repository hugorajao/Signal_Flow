'use client';

export default function LoadingPulse() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
