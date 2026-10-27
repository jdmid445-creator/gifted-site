// The live "people are using it" feed. Only real, completed orders are recorded,
// and only after Bitrefill confirms the card was delivered.
// Storage: Upstash Redis over REST (add it in Vercel → Storage). Without it the feed is simply empty.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'gifted:feed';
const MAX = 50;

export const feedConfigured = () => Boolean(URL_ && TOKEN);

async function redis(cmd) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'feed store error');
  return body.result;
}

const clean = (s, n) => String(s || '').replace(/[<>]/g, '').slice(0, n);

// Record a completed order once. Private orders keep no token, chain or transaction,
// and their time is rounded so the feed can't be used to match a payment.
export async function recordOrder({ invoiceId, name, value, currency, mode, symbol, tx }) {
  if (!feedConfigured()) return;
  const first = await redis(['SET', `gifted:seen:${invoiceId}`, '1', 'NX', 'EX', 60 * 60 * 24 * 30]);
  if (first !== 'OK') return; // already recorded
  const isPrivate = mode === 'private';
  const now = Date.now();
  const entry = {
    name: clean(name, 60),
    value: Number(value) || null,
    currency: clean(currency, 6),
    mode: isPrivate ? 'private' : 'standard',
    symbol: isPrivate ? null : clean(symbol, 16) || null,
    tx: isPrivate ? null : (/^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(tx || '') ? tx : null),
    at: isPrivate ? Math.floor(now / 900000) * 900000 : now,
  };
  await redis(['LPUSH', KEY, JSON.stringify(entry)]);
  await redis(['LTRIM', KEY, '0', String(MAX - 1)]);
}

export async function readFeed(limit = 20) {
  if (!feedConfigured()) return [];
  const rows = await redis(['LRANGE', KEY, '0', String(limit - 1)]);
  return (rows || []).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}
