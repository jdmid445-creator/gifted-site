import { NextResponse } from 'next/server';
import { houdiniConfigured, popularTokens, searchTokens } from '@/lib/houdini';
import { rateLimit } from '@/lib/ratelimit';

export async function GET(req) {
  if (!houdiniConfigured()) return NextResponse.json({ enabled: false, tokens: [] });
  const term = (new URL(req.url).searchParams.get('term') || '').trim().slice(0, 60);
  try {
    if (!term) {
      const res = NextResponse.json({ enabled: true, tokens: await popularTokens() });
      res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res;
    }
    if (!rateLimit(req, { key: 'hd-tokens', limit: 60, windowMs: 60_000 })) return NextResponse.json({ error: 'Too many searches. Try again in a minute.' }, { status: 429 });
    return NextResponse.json({ enabled: true, tokens: await searchTokens(term) });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Couldn’t load coins' }, { status: 502 });
  }
}
