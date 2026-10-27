import { NextResponse } from 'next/server';
import { readFeed, feedConfigured } from '@/lib/feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await readFeed(20);
    return NextResponse.json({ live: feedConfigured(), orders }, { headers: { 'Cache-Control': 's-maxage=10, stale-while-revalidate=20' } });
  } catch {
    return NextResponse.json({ live: false, orders: [] });
  }
}
