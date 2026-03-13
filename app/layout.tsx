import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SignaFlow — Visual Backtesting Engine',
  description: 'Build and backtest quantitative trading strategies visually by wiring logic nodes together.',
  openGraph: {
    title: 'SignaFlow — Visual Backtesting Engine',
    description: 'Build and backtest quantitative trading strategies visually.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans bg-root text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
