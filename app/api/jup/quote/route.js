import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { quoteExactOut } from '@/lib/jupiter';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  if (!rateLimit(req, { key: 'quote', limit: 40, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  }
  const { inputMint, usdcAtomic } = await req.json().catch(() => ({}));
  try {
    new PublicKey(inputMint);
  } catch {
    return NextResponse.json({ error: 'Unknown token' }, { status: 400 });
  }
  if (!/^\d+$/.test(String(usdcAtomic || '')) || BigInt(usdcAtomic) <= 0n) {
    return NextResponse.json({ error: 'Bad amount' }, { status: 400 });
  }
  try {
    const quote = await quoteExactOut({ inputMint, usdcAmountAtomic: usdcAtomic });
    return NextResponse.json({ quote });
  } catch (e) {
    return NextResponse.json({ error: `No route for this token right now (${e.message})` }, { status: 502 });
  }
}
