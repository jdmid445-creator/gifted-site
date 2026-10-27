import { NextResponse } from 'next/server';
import { houdiniConfigured, getOrder, userHeaders, STATUS } from '@/lib/houdini';

export async function GET(req, { params }) {
  if (!houdiniConfigured()) return NextResponse.json({ error: 'Not enabled' }, { status: 503 });
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id || '')) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  const tz = new URL(req.url).searchParams.get('tz') || 'UTC';
  try {
    const o = await getOrder(id, userHeaders(req, tz));
    return NextResponse.json({
      status: o.status,
      label: STATUS[o.status] || o.displayStatus || 'WAITING',
      outAmount: o.outAmount,
      eta: o.eta,
      expires: o.expires,
      refunded: o.status === 7,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
