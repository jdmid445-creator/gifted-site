import { NextResponse } from 'next/server';
import { oneClick, errorMessage } from '@/lib/oneclick';

export const dynamic = 'force-dynamic';

// When someone sends SOL by hand (no "Pay with wallet"), the network has to discover the deposit
// itself, which can lag. While an order waits, look for the deposit on Solana and hand the network
// the transaction hash right away (the same thing the wallet button does). Each tx is sent once.
const RPC = process.env.SOLANA_RPC || process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const submitted = new Set();
const isSolAddress = (a) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);

async function nudgeSolanaDeposit(depositAddress) {
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [depositAddress, { limit: 3, commitment: 'confirmed' }] }),
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    const sigs = (await res.json())?.result || [];
    for (const s of sigs) {
      if (s.err || submitted.has(s.signature)) continue;
      submitted.add(s.signature);
      await oneClick('/v0/deposit/submit', { method: 'POST', body: JSON.stringify({ txHash: s.signature, depositAddress }) });
    }
  } catch {}
}

export async function GET(request) {
  const depositAddress = new URL(request.url).searchParams.get('depositAddress');
  if (!depositAddress || depositAddress.length > 200) {
    return NextResponse.json({ error: 'Missing depositAddress' }, { status: 400 });
  }

  let { ok, status, data } = await oneClick(`/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`);
  if (ok && data?.status === 'PENDING_DEPOSIT' && isSolAddress(depositAddress)) await nudgeSolanaDeposit(depositAddress);
  if (!ok) {
    return NextResponse.json({ error: errorMessage(data, 'Could not check status') }, { status });
  }

  const details = data?.swapDetails || {};
  const firstHash = (list) => (Array.isArray(list) && list[0] ? list[0].hash || null : null);

  return NextResponse.json({
    status: data?.status || 'UNKNOWN',
    updatedAt: data?.updatedAt || null,
    originTx: firstHash(details.originChainTxHashes),
    destinationTx: firstHash(details.destinationChainTxHashes),
    amountOutFormatted: details.amountOutFormatted ?? null,
    refundedAmountFormatted: details.refundedAmountFormatted ?? null,
  });
}
