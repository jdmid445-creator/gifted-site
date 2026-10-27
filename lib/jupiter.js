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

export async function tokenInfo(mints) {
  if (!mints.length) return {};
  const body = await call(`${TOKENS}/search?query=${encodeURIComponent(mints.join(','))}`).catch(() => []);
  const out = {};
  for (const t of Array.isArray(body) ? body : []) {
    const id = t.id || t.address;
    if (id) out[id] = { symbol: t.symbol, name: t.name, icon: t.icon || t.logoURI || null, usdPrice: t.usdPrice ?? null };
  }
  return out;
}
