import { NextResponse } from 'next/server';
import { oneClick, confidentialityLevel, errorMessage } from '@/lib/oneclick';
import { getInvoicePayment } from '@/lib/bitrefill';
import { checkInvoiceToken } from '@/lib/access';
import { isValidAddress } from '@/lib/chains';
import { rateLimit } from '@/lib/ratelimit';
import { toAtomic } from '@/lib/units';
import { USDC_MINT } from '@/lib/jupiter';

export const dynamic = 'force-dynamic';

// Private checkout: NEAR Intents' solvers pay the gift card invoice, so the payment that reaches
// the shop comes from the network, not from the buyer's wallet.
// The recipient and amount are read from Bitrefill on the server, never taken from the browser.
export async function POST(req) {
  if (!rateLimit(req, { key: 'pquote', limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  }
  const input = await req.json().catch(() => null);
  const { invoiceId, token, originAsset, refundTo, dry } = input || {};
  if (!invoiceId || !checkInvoiceToken(invoiceId, token)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  if (typeof originAsset !== 'string' || !originAsset) {
    return NextResponse.json({ error: 'Pick what to pay with' }, { status: 400 });
  }

  // Look up both sides in the network's own token list.
  const list = await oneClick('/v0/tokens');
  if (!list.ok || !Array.isArray(list.data)) {
    return NextResponse.json({ error: 'The private network is unavailable right now' }, { status: 502 });
  }
  const origin = list.data.find((t) => t.assetId === originAsset);
  const usdcSol = list.data.find((t) => t.blockchain === 'sol' && (t.contractAddress === USDC_MINT || t.symbol === 'USDC'));
  if (!origin) return NextResponse.json({ error: 'That asset isn’t supported' }, { status: 400 });
  if (!usdcSol) return NextResponse.json({ error: 'The network isn’t offering USDC on Solana right now' }, { status: 502 });
  if (!isValidAddress(origin.blockchain, refundTo || '')) {
    return NextResponse.json({ error: 'Enter a valid refund address on the chain you’re paying from' }, { status: 400 });
  }

  let inv;
  try {
    inv = await getInvoicePayment(invoiceId);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
  if (!inv.payTo || !inv.price || inv.status === 'complete') {
    return NextResponse.json({ error: 'This order can’t take a payment anymore. Start a new one.' }, { status: 409 });
  }

  const body = {
    dry: Boolean(dry),
    swapType: 'EXACT_OUTPUT',
    slippageTolerance: 100,
    originAsset,
    depositType: 'ORIGIN_CHAIN',
    destinationAsset: usdcSol.assetId,
    amount: toAtomic(inv.price, usdcSol.decimals ?? 6),
    refundTo: refundTo.trim(),
    refundType: 'ORIGIN_CHAIN',
    recipient: inv.payTo,
    recipientType: 'DESTINATION_CHAIN',
    deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  // Ask for the strongest confidentiality first. Confidential quotes have fewer solvers, so when one comes back
  // with no liquidity, step down a level. Either way the shop is paid by the network, never by the buyer's wallet.
  const LEVELS = ['advanced', 'basic', null];
  const pref = confidentialityLevel();
  const start = pref === 'public' ? 2 : Math.max(0, LEVELS.indexOf(pref));
  let ok, status, data, used = null;
  for (const level of LEVELS.slice(start)) {
    const attempt = { ...body };
    if (level) attempt.confidentiality = level;
    ({ ok, status, data } = await oneClick('/v0/quote', { method: 'POST', body: JSON.stringify(attempt) }));
    used = level;
    if (ok) break;
    const msg = errorMessage(data, '');
    if (!/liquidity|authentication|no route|not available/i.test(msg)) break;
  }
  body.confidentiality = used || 'standard';
  if (!ok) return NextResponse.json({ error: errorMessage(data, 'No private route for this asset right now') }, { status });

  const q = data?.quote || {};
  return NextResponse.json({
    dry: body.dry,
    confidentiality: body.confidentiality,
    chain: origin.blockchain,
    symbol: origin.symbol,
    decimals: origin.decimals,
    contractAddress: origin.contractAddress ?? null,
    depositAddress: q.depositAddress || null,
    depositMemo: q.depositMemo || null,
    amountIn: q.amountIn ?? q.maxAmountIn ?? null,
    amountInFormatted: q.amountInFormatted ?? null,
    usdcAmount: String(inv.price),
    timeEstimate: q.timeEstimate ?? null,
    deadline: q.deadline ?? body.deadline,
  });
}
