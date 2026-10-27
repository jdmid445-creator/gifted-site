import { NextResponse } from 'next/server';
import { houdiniConfigured } from '@/lib/houdini';

export async function GET() {
  return NextResponse.json({ enabled: houdiniConfigured() });
}
