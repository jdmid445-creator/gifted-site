// Server-only Jupiter proxy so the API key stays private.
// Endpoints are configurable because Jupiter versions its API.
const BASE = process.env.JUPITER_API_BASE || 'https://api.jup.ag/swap/v1';
const TOKENS = process.env.JUPITER_TOKENS_BASE || 'https://api.jup.ag/tokens/v2';

export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qy1xbybapC8G4wEGGkZwyTDt1v';

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (process.env.JUPITER_API_KEY) h['x-api-key'] = process.env.JUPITER_API_KEY;
  return h;
}

async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...headers(), ...(init.headers || {}) }, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || body?.message || `Jupiter error ${res.status}`);
  return body;
}

// Quote for receiving an exact USDC amount (what the invoice asks for).
export function quoteExactOut({ inputMint, usdcAmountAtomic, slippageBps = 100 }) {
  const params = new URLSearchParams({
    inputMint,
    outputMint: USDC_MINT,
    amount: String(usdcAmountAtomic),
    swapMode: 'ExactOut',
    slippageBps: String(slippageBps),
  });
  return call(`${BASE}/quote?${params}`);
}

export function swapInstructions({ quoteResponse, userPublicKey, destinationTokenAccount }) {
  return call(`${BASE}/swap-instructions`, {
    method: 'POST',
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      destinationTokenAccount,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });
}

function shapeToken(t) {
  return {
    mint: t.id || t.address,
    symbol: t.symbol,
    name: t.name,
    icon: t.icon || t.logoURI || null,
    decimals: Number.isFinite(t.decimals) ? t.decimals : null,
    usdPrice: t.usdPrice ?? null,
    verified: Boolean(t.isVerified),
    liquidity: t.liquidity ?? null,
  };
}

export async function tokenInfo(mints) {
  if (!mints.length) return {};
  const body = await call(`${TOKENS}/search?query=${encodeURIComponent(mints.join(','))}`).catch(() => []);
  const out = {};
  for (const t of Array.isArray(body) ? body : []) {
    const x = shapeToken(t);
    if (x.mint) out[x.mint] = x;
  }
  return out;
}

// Free-text search: symbol, name or mint.
export async function searchTokens(query) {
  const body = await call(`${TOKENS}/search?query=${encodeURIComponent(query)}`).catch(() => []);
  return (Array.isArray(body) ? body : [])
    .map(shapeToken)
    .filter((t) => t.mint && t.symbol)
    .sort((a, b) => Number(b.verified) - Number(a.verified) || (b.liquidity || 0) - (a.liquidity || 0))
    .slice(0, 20);
}

// What people are actually trading on Solana right now (verified, liquid tokens only).
let top = { at: 0, items: [] };
export async function topTokens() {
  if (top.items.length && Date.now() - top.at < 10 * 60_000) return top.items;
  const body = await call(`${TOKENS}/toptraded/24h?limit=60`).catch(() => []);
  const items = (Array.isArray(body) ? body : [])
    .map(shapeToken)
    .filter((t) => t.mint && t.symbol && t.verified && (t.liquidity || 0) > 250_000);
  if (items.length) top = { at: Date.now(), items };
  return items;
}
