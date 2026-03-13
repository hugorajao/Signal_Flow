'use client';

import { useEffect, useRef, memo } from 'react';

interface TVWidgetBaseProps {
  scriptSrc: string;
  config: Record<string, unknown>;
  className?: string;
  widgetKey?: string;
}

export const TVWidgetBase = memo(function TVWidgetBase({
  scriptSrc,
  config,
  className = '',
  widgetKey,
}: TVWidgetBaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.type = 'text/javascript';
    script.textContent = JSON.stringify({
      ...config,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'en',
    });
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [scriptSrc, widgetKey, config]);

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
    />
  );
});
