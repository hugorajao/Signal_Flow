import { NextRequest, NextResponse } from 'next/server';
import { ALL_SYMBOLS } from '@/lib/constants';

interface SymbolResult {
  symbol: string;
  name: string;
  type: 'equity' | 'crypto';
}

interface SymbolsResponseBody {
  symbols: SymbolResult[];
}

export async function GET(request: NextRequest): Promise<NextResponse<SymbolsResponseBody>> {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('query')?.toLowerCase().trim() ?? '';

  let filtered = ALL_SYMBOLS;

  if (query.length > 0) {
    filtered = ALL_SYMBOLS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query),
    );
  }

  const symbols: SymbolResult[] = filtered.slice(0, 10).map((s) => ({
    symbol: s.id,
    name: s.name,
    type: s.type,
  }));

  return NextResponse.json(
    { symbols },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    },
  );
}
