import { NextResponse } from 'next/server';
import { oneClick, errorMessage } from '@/lib/oneclick';

export const dynamic = 'force-dynamic';

// Tells the network about the deposit transaction so the swap starts sooner. Optional but faster.
export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { txHash, depositAddress } = input || {};
  if (typeof txHash !== 'string' || typeof depositAddress !== 'string' || !txHash || !depositAddress) {
    return NextResponse.json({ error: 'Missing txHash or depositAddress' }, { status: 400 });
  }

  const { ok, status, data } = await oneClick('/v0/deposit/submit', {
    method: 'POST',
    body: JSON.stringify({ txHash, depositAddress }),
  });
  if (!ok) return NextResponse.json({ error: errorMessage(data, 'Could not submit deposit') }, { status });
  return NextResponse.json({ ok: true });
}
