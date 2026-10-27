import { NextResponse } from 'next/server';
import { searchProducts, bitrefillConfigured } from '@/lib/bitrefill';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').slice(0, 100);
  const country = (searchParams.get('country') || '').slice(0, 2);
  try {
    const products = await searchProducts(q, country);
    return NextResponse.json({ demo: !bitrefillConfigured(), products });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
