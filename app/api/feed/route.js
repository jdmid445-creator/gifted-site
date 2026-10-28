import { NextResponse } from 'next/server';
import { readFeed, feedConfigured } from '@/lib/feed';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // TEMP: field names only (no values) to map Bitrefill's invoice shape. Remove after.
    if (new URL(req.url).searchParams.get('shape') === '1') {
      const { listInvoices } = await import('@/lib/bitrefill');
      const inv = (await listInvoices(10)).find((i) => !/unpaid/.test(String(i.status))) || {};
      const keysOf = (o) => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? ['array', keysOf(v[0])] : v && typeof v === 'object' ? keysOf(v) : typeof v])) : typeof o);
      return NextResponse.json({ status: inv.status, shape: keysOf(inv) });
    }
    const orders = await readFeed(20);
    return NextResponse.json({ live: feedConfigured(), orders }, { headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=20' } });
  } catch (e) {
    return NextResponse.json({ live: false, orders: [], note: String(e?.message || e).slice(0, 120) });
  }
}
