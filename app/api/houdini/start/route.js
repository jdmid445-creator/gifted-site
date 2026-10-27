import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { houdiniConfigured, privateQuote, createExchange, tokenById, userHeaders } from '@/lib/houdini';
import { tokenInfo } from '@/lib/jupiter';
import { rateLimit } from '@/lib/ratelimit';

export const maxDuration = 30;
const SOL = 'So11111111111111111111111111111111111111112';
// Extra SOL so the private wallet can create token accounts and pay network fees.
const SOL_FEE_BUFFER = 0.015;

export async function POST(req) {
  if (!houdiniConfigured()) return NextResponse.json({ error: 'Max privacy is not switched on yet.' }, { status: 503 });
  if (!rateLimit(req, { key: 'hd-start', limit: 6, windowMs: 60_000 })) return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }
  const { usdcAmount, fromId, fromPrice, refundAddress, addressTo, timezone } = body || {};

  try { new PublicKey(addressTo); } catch { return NextResponse.json({ error: 'Private wallet address is invalid.' }, { status: 400 }); }
  const usd = Number(usdcAmount);
  if (!Number.isFinite(usd) || usd <= 0 || usd > 5000) return NextResponse.json({ error: 'Card price is invalid.' }, { status: 400 });
  if (!fromId || typeof fromId !== 'string') return NextResponse.json({ error: 'Pick a coin to pay with.' }, { status: 400 });
  if (!refundAddress || String(refundAddress).trim().length < 8) return NextResponse.json({ error: 'Add your refund address for the coin you’re sending.' }, { status: 400 });

  const headers = userHeaders(req, timezone);
  try {
    const [jup, from] = await Promise.all([tokenInfo([SOL]).catch(() => ({})), tokenById(fromId)]);
    const solPrice = jup[SOL]?.usdPrice;
    if (!solPrice) throw new Error('Couldn’t price SOL right now. Try again.');
    // 5% headroom on the card price covers price moves while the private route runs.
    const solOut = Number(((usd * 1.05) / solPrice + SOL_FEE_BUFFER).toFixed(4));
    const quote = await privateQuote({ fromId, solOut, fromPrice: from?.price ?? (Number(fromPrice) || null), solPrice, refundAddress: String(refundAddress).trim(), headers });
    const order = await createExchange({ quoteId: quote.quoteId, addressTo, refundAddress: String(refundAddress).trim(), headers });
    return NextResponse.json({
      houdiniId: order.houdiniId,
      depositAddress: order.depositAddress,
      depositTag: order.depositTag || null,
      inAmount: order.inAmount,
      inSymbol: order.inSymbol,
      outAmount: order.outAmount,
      outSymbol: order.outSymbol,
      expires: order.expires,
      eta: order.eta ?? quote.duration ?? null,
      exact: quote.exact,
      solNeeded: solOut,
      fromChain: from?.chainName || null,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Couldn’t start a private route.' }, { status: 502 });
  }
}
