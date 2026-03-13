'use client';

interface KbdProps {
  children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-hover)] border border-[var(--border-default)] rounded">
      {children}
    </kbd>
  );
}
