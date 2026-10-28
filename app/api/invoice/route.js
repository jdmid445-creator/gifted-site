import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { bitrefillConfigured, getProduct, createInvoice } from '@/lib/bitrefill';
import { signInvoice } from '@/lib/access';
import { rateLimit } from '@/lib/ratelimit';
import { toAtomic } from '@/lib/units';

export async function POST(req) {
  // Each call can create a real invoice, so keep it tight.
  if (!rateLimit(req, { key: 'invoice', limit: 8, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  // `wallet` is the Solana address Bitrefill refunds to if an order fails.
  // In private checkout the buyer can give a fresh wallet here instead of their main one.
  const { productId, packageId, value, wallet } = body || {};

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json({ error: 'Add a Solana refund address (or connect a Solana wallet)' }, { status: 400 });
  }

  // The price always comes from the catalog on the server, never from the browser.
  const product = await getProduct(String(productId || '')).catch(() => null);
  if (!product) return NextResponse.json({ error: 'That gift card is unavailable' }, { status: 404 });

  let faceValue;
  if (packageId) {
    const pkg = product.packages.find((p) => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: 'Pick one of the listed amounts' }, { status: 400 });
    faceValue = pkg.value;
  } else {
    const v = Number(value);
    const r = product.range;
    if (!r || !Number.isFinite(v) || v < r.min || v > r.max) {
      return NextResponse.json({ error: 'Amount is outside the allowed range' }, { status: 400 });
    }
    faceValue = v;
  }

  if (!bitrefillConfigured()) {
    return NextResponse.json({
      demo: true,
      faceValue,
      currency: product.currency,
      message: 'Demo mode: add Bitrefill API credentials to sell real gift cards.',
    });
  }

  try {
    // The app polls the invoice for status, so no webhook is needed yet.
    const inv = await createInvoice({
      productId: product.id,
      packageId: packageId && !String(packageId).startsWith('r:') ? packageId : null,
      value: packageId && !String(packageId).startsWith('r:') ? null : faceValue,
      refundAddress: wallet,
    });
    if (!inv.payTo || !inv.price || String(inv.currency || '').toUpperCase().indexOf('USDC') === -1) {
      return NextResponse.json({ error: 'Payment details were incomplete. Try again.' }, { status: 502 });
    }
    return NextResponse.json({
      demo: false,
      id: inv.id,
      payTo: inv.payTo,
      usdcAmount: String(inv.price),
      usdcAtomic: toAtomic(inv.price),
      faceValue,
      currency: product.currency,
      accessToken: signInvoice(inv.id),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
