import { NextResponse } from 'next/server';
import { oneClick, errorMessage } from '@/lib/oneclick';
import { CHAINS } from '@/lib/chains';

export const dynamic = 'force-dynamic';

// Assets you can pay with in private checkout (the NEAR Intents list, trimmed to our chains).
export async function GET() {
  const { ok, status, data } = await oneClick('/v0/tokens');
  if (!ok || !Array.isArray(data)) {
    return NextResponse.json({ error: errorMessage(data, 'Could not load supported assets') }, { status: ok ? 502 : status });
  }
  const supported = new Set(CHAINS.map((c) => c.key));
  const tokens = data
    .filter((t) => t && supported.has(t.blockchain))
    .map((t) => ({ assetId: t.assetId, symbol: t.symbol, decimals: t.decimals, blockchain: t.blockchain, price: t.price ?? null, contractAddress: t.contractAddress ?? null }));
  return NextResponse.json({ tokens }, { headers: { 'Cache-Control': 's-maxage=300' } });
}
