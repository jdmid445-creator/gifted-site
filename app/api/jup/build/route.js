import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { swapInstructions, USDC_MINT } from '@/lib/jupiter';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  if (!rateLimit(req, { key: 'build', limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  }
  const { quoteResponse, userPublicKey, payTo } = await req.json().catch(() => ({}));
  let payToKey;
  try {
    new PublicKey(userPublicKey);
    payToKey = new PublicKey(payTo);
  } catch {
    return NextResponse.json({ error: 'Bad wallet or payment address' }, { status: 400 });
  }
  // USDC lands straight in the invoice's USDC account. GIFTED never touches it.
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    new PublicKey(USDC_MINT),
    payToKey,
    true
  ).toBase58();
  try {
    const ix = await swapInstructions({ quoteResponse, userPublicKey, destinationTokenAccount });
    return NextResponse.json({ ...ix, destinationTokenAccount });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
