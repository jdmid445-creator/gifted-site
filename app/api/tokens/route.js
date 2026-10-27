import { NextResponse } from 'next/server';
import { tokenInfo, searchTokens, topTokens } from '@/lib/jupiter';
import { rateLimit } from '@/lib/ratelimit';

const MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(req) {
  const sp = new URL(req.url).searchParams;

  // ?list=top  -> popular tokens for the "Pay with" list
  if (sp.get('list') === 'top') {
    const tokens = await topTokens().catch(() => []);
    const res = NextResponse.json({ tokens });
    res.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res;
  }

  // ?q=bonk   -> search by symbol, name or mint
  const q = (sp.get('q') || '').trim().slice(0, 64);
  if (q) {
    if (!rateLimit(req, { key: 'tok-search', limit: 60, windowMs: 60_000 })) {
      return NextResponse.json({ error: 'Too many searches. Try again in a minute.' }, { status: 429 });
    }
    const tokens = await searchTokens(q).catch(() => []);
    return NextResponse.json({ tokens });
  }

  // ?mints=a,b -> details for known mints
  const mints = (sp.get('mints') || '').split(',').map((m) => m.trim()).filter((m) => MINT.test(m)).slice(0, 50);
  const info = await tokenInfo(mints).catch(() => ({}));
  return NextResponse.json({ tokens: info });
}
