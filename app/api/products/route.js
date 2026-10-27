import { NextResponse } from 'next/server';
import { searchProducts, shelfProducts, bitrefillConfigured } from '@/lib/bitrefill';
import { CATEGORIES } from '@/lib/brands';

export const maxDuration = 30;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 100);
  const shelf = searchParams.get('shelf') || '';
  const country = (searchParams.get('country') || 'US').slice(0, 2);
  try {
    let products;
    if (!q && CATEGORIES.includes(shelf)) {
      products = await shelfProducts(shelf, country);
      // never show an empty shop: fall back to a plain search for the country
      if (!products.length) products = await searchProducts('gift card', country);
    } else {
      products = await searchProducts(q, country);
    }
    const res = NextResponse.json({ demo: !bitrefillConfigured(), products });
    res.headers.set('Cache-Control', q ? 'public, s-maxage=300, stale-while-revalidate=600' : 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Could not load gift cards' }, { status: 502 });
  }
}
