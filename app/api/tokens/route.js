import { NextResponse } from 'next/server';
import { tokenInfo } from '@/lib/jupiter';

export async function GET(req) {
  const mints = (new URL(req.url).searchParams.get('mints') || '')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m))
    .slice(0, 50);
  const info = await tokenInfo(mints).catch(() => ({}));
  return NextResponse.json({ tokens: info });
}
