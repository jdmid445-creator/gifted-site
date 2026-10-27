import { NextResponse } from 'next/server';
import { getInvoice } from '@/lib/bitrefill';
import { checkInvoiceToken } from '@/lib/access';
import { recordOrder } from '@/lib/feed';

export async function GET(req, { params }) {
  const { id } = await params;
  const q = new URL(req.url).searchParams;
  if (!checkInvoiceToken(id, q.get('token'))) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  try {
    const inv = await getInvoice(id);
    // Once Bitrefill confirms delivery, the order goes on the public live feed (once).
    if (inv.status === 'complete') {
      await recordOrder({
        invoiceId: id,
        name: q.get('name'),
        value: q.get('value'),
        currency: q.get('currency'),
        mode: q.get('mode'),
        symbol: q.get('symbol'),
        tx: q.get('tx'),
      }).catch(() => {});
    }
    return NextResponse.json(inv, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
