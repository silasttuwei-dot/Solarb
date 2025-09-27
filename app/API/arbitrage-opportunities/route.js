// app/api/arbitrage-opportunities/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const filter    = searchParams.get('filter')    || 'All Opportunities';
  const minProfit = searchParams.get('minProfit') || '0.5';
  const dexes     = searchParams.get('dexes')     || '';

  // Proxy to Render scanner service
  const upstream = new URL('/arbitrage-opportunities', process.env.SCANNER_URL);
  upstream.searchParams.set('filter', filter);
  upstream.searchParams.set('minProfit', minProfit);
  if (dexes) upstream.searchParams.set('dexes', dexes);

  const res = await fetch(upstream, { next: { revalidate: 0 } });
  if (!res.ok) return Response.json({ error: 'Scanner unavailable' }, { status: 503 });
  return Response.json(await res.json());
}
