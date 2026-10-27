import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/bitrefill';

export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
