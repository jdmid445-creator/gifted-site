import { NextResponse } from 'next/server';
import { oneClick, errorMessage } from '@/lib/oneclick';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const depositAddress = new URL(request.url).searchParams.get('depositAddress');
  if (!depositAddress || depositAddress.length > 200) {
    return NextResponse.json({ error: 'Missing depositAddress' }, { status: 400 });
  }

  const { ok, status, data } = await oneClick(`/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`);
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
