import { NextResponse } from 'next/server';
import { searchProducts, bitrefillConfigured } from '@/lib/bitrefill';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').slice(0, 100);
  const country = (searchParams.get('country') || '').slice(0, 2);
  try {
    const products = await searchProducts(q, country);
    const res = NextResponse.json({ demo: !bitrefillConfigured(), products });
    res.headers.set('Cache-Control', q ? 'public, s-maxage=300, stale-while-revalidate=600' : 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
