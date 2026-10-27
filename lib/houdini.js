// Server-only Houdini Swap partner client (private swaps routed through Monero).
// Keys live in Vercel env vars: HOUDINI_API_KEY + HOUDINI_API_SECRET.
const BASE = process.env.HOUDINI_API_BASE || 'https://api-partner.houdiniswap.com/v2';

export function houdiniConfigured() {
  return Boolean(process.env.HOUDINI_API_KEY && process.env.HOUDINI_API_SECRET);
}

// Houdini requires the end user's IP, user agent and timezone on quote/order calls
// for its own compliance screening. We pass them through and store nothing.
export function userHeaders(req, timezone) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  return {
    'x-user-ip': ip,
    'x-user-agent': (req.headers.get('user-agent') || '').slice(0, 300),
    'x-user-timezone': (timezone || 'UTC').slice(0, 64),
  };
}

async function call(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `${process.env.HOUDINI_API_KEY}:${process.env.HOUDINI_API_SECRET}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = data?.code || data?.error || '';
    const msg = data?.message || data?.error?.message || (typeof data?.error === 'string' ? data.error : '') || `Houdini error ${res.status}`;
    const err = new Error(friendly(code, msg));
    err.code = code;
    throw err;
  }
  return data;
}

function friendly(code, msg) {
  const map = {
    FIXED_RATE_QUOTE_EXPIRED: 'That price expired. Try again for a fresh one.',
    REFUND_ADDRESS_REQUIRED_FOR_FIXED_RATE: 'Add your refund address first.',
    INTERMEDIATE_REFUND_ADDRESS_REQUIRED: 'This route needs an extra refund address. Try another coin.',
  };
  return map[code] || msg;
}

const shapeToken = (t) => ({
  id: t.id,
  symbol: t.symbol,
  name: t.name,
  chain: t.chain,
  chainName: t.chainData?.name || t.chain,
  icon: t.icon || null,
  price: t.price ?? null,
  memoNeeded: Boolean(t.chainData?.memoNeeded),
  mainnet: Boolean(t.mainnet),
});

export async function searchTokens(term) {
  const params = new URLSearchParams({ hasCex: 'true', pageSize: '40', page: '1' });
  if (term) params.set('term', term);
  const data = await call(`/tokens?${params}`);
  return (data.tokens || []).filter((t) => t.enabled !== false && !t.unverified).map(shapeToken);
}

// Popular coins to show first, found by exact symbol + chain.
const POPULAR = [
  ['BTC', 'bitcoin'], ['ETH', 'ethereum'], ['SOL', 'solana'], ['XMR', 'monero'], ['USDT', 'tron'],
  ['USDT', 'ethereum'], ['USDC', 'ethereum'], ['LTC', 'litecoin'], ['DOGE', 'dogecoin'], ['BNB', 'bsc'],
  ['TRX', 'tron'], ['ZEC', 'zcash'], ['TON', 'ton'], ['XRP', 'ripple'],
];
let popularCache = { at: 0, items: [] };
export async function popularTokens() {
  if (popularCache.items.length && Date.now() - popularCache.at < 3600_000) return popularCache.items;
  const results = await Promise.allSettled(POPULAR.map(([symbol]) => call(`/tokens?${new URLSearchParams({ hasCex: 'true', symbol, pageSize: '50' })}`)));
  const items = [];
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    const [, chain] = POPULAR[i];
    const list = (r.value.tokens || []).filter((t) => t.enabled !== false);
    const pick = list.find((t) => (t.chain || '').toLowerCase() === chain || (t.chainData?.shortName || '').toLowerCase() === chain) || null;
    if (pick && !items.find((x) => x.id === pick.id)) items.push(shapeToken(pick));
  });
  if (items.length) popularCache = { at: Date.now(), items };
  return items;
}

// The token we receive on Solana: native SOL (so the private wallet can pay its own fees).
let solId = null;
export async function solanaSolId() {
  if (solId) return solId;
  const data = await call(`/tokens?${new URLSearchParams({ hasCex: 'true', symbol: 'SOL', pageSize: '50' })}`);
  const t = (data.tokens || []).find((x) => x.mainnet && /sol/i.test(x.chain || x.chainData?.shortName || ''))
    || (data.tokens || []).find((x) => /solana/i.test(x.chainData?.name || ''));
  if (!t) throw new Error('Private route to Solana is unavailable right now.');
  solId = t.id;
  return solId;
}

export async function tokenById(id) {
  const t = await call(`/tokens/${encodeURIComponent(id)}`).catch(() => null);
  return t ? shapeToken(t.token || t) : null;
}

// Private (multi-hop, via Monero) quote that delivers exactly `solOut` SOL.
// Falls back to a send-side private quote if no fixed exact-out route exists.
export async function privateQuote({ fromId, solOut, fromPrice, solPrice, refundAddress, headers }) {
  const to = await solanaSolId();
  const base = { from: fromId, to, types: 'private', useXmr: 'true', rotatePayoutWallets: 'true', rotateFallback: 'true' };
  if (refundAddress) base.refundAddress = refundAddress;

  const pick = (quotes) => (quotes || []).filter((q) => q.type === 'private' && !q.filtered && !q.error && q.quoteId)
    .sort((a, b) => (a.amountIn ?? Infinity) - (b.amountIn ?? Infinity))[0] || null;

  // 1) exact output: SOL arriving is guaranteed
  try {
    const p = new URLSearchParams({ ...base, amount: String(solOut), amountType: 'receive', fixed: 'true', sort: 'amountIn', sortOrder: 'asc' });
    const q = pick((await call(`/quotes?${p}`, { headers })).quotes);
    if (q) return { ...q, exact: true };
  } catch {}

  // 2) floating rate: send a bit more so the SOL that arrives still covers the card
  if (!fromPrice || !solPrice) throw new Error('No private route for that coin right now. Try another coin.');
  const amountIn = (solOut * solPrice / fromPrice) * 1.06;
  const p = new URLSearchParams({ ...base, amount: amountIn.toPrecision(8) });
  const q = pick((await call(`/quotes?${p}`, { headers })).quotes);
  if (!q) throw new Error('No private route for that coin right now. Try another coin.');
  if (q.amountOut < solOut) throw new Error('The private route is short for this amount right now. Try another coin.');
  return { ...q, exact: false };
}

export function createExchange({ quoteId, addressTo, refundAddress, headers }) {
  return call('/exchanges', { method: 'POST', body: { quoteId, addressTo, ...(refundAddress ? { refundAddress } : {}) }, headers });
}

export function getOrder(id, headers) {
  return call(`/orders/${encodeURIComponent(id)}`, { headers });
}

export const STATUS = { '-2': 'INITIALIZING', '-1': 'NEW', 0: 'WAITING', 1: 'CONFIRMING', 2: 'EXCHANGING', 3: 'ANONYMIZING', 4: 'FINISHED', 5: 'EXPIRED', 6: 'FAILED', 7: 'REFUNDED', 8: 'DELETED' };
