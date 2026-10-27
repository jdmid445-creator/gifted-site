import { NextResponse } from 'next/server';
import { getInvoice } from '@/lib/bitrefill';
import { checkInvoiceToken } from '@/lib/access';

export async function GET(req, { params }) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get('token');
  if (!checkInvoiceToken(id, token)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }
  try {
    const inv = await getInvoice(id);
    return NextResponse.json(inv, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
