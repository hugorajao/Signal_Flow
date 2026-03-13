import ResultsPanel from "@/components/panels/ResultsPanel";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-[#0A0A0B]">
      {/* Top bar placeholder */}
      <header className="flex items-center h-12 px-4 border-b border-zinc-800 bg-[#111113]">
        <span className="text-sm font-medium text-zinc-300">SignaFlow</span>
        <span className="ml-2 text-xs text-zinc-600">Strategy Backtester</span>
      </header>

      {/* Main canvas area placeholder */}
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
        Strategy Canvas (main branch)
      </div>

      {/* Results panel with comparison tab */}
      <div className="h-[45vh] min-h-[320px]">
        <ResultsPanel />
      </div>
    </main>
  );
}
