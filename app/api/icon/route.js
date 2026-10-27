// Image relay for token icons and gift card art. Many of these live on IPFS gateways
// or CDNs that block hotlinking or load slowly; fetching them here and caching at the
// edge makes every icon show up. Only images, only https, max 1.5 MB.
export const runtime = 'nodejs';

const MAX = 1.5 * 1024 * 1024;

export async function GET(req) {
  const u = new URL(req.url).searchParams.get('u') || '';
  let target;
  try { target = new URL(u); } catch { return new Response('Bad url', { status: 400 }); }
  if (target.protocol !== 'https:' || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(target.hostname)) {
    return new Response('Not allowed', { status: 400 });
  }
  try {
    const res = await fetch(target, { headers: { 'User-Agent': 'gifted-icon/1.0', Accept: 'image/*' }, redirect: 'follow', signal: AbortSignal.timeout(8000) });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) return new Response('Not an image', { status: 404 });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX) return new Response('Too large', { status: 413 });
    return new Response(buf, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch {
    return new Response('Fetch failed', { status: 502 });
  }
}
