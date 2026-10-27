// Server-only Bitrefill client. Credentials never reach the browser.
// Personal API key  -> BITREFILL_API_KEY            (Bearer, for testing)
// Business/Affiliate -> BITREFILL_API_ID + _SECRET   (Basic, for launch)
import { DEMO_PRODUCTS } from './demo';
import { POPULAR_BRANDS, matches, brandFor, domainFor } from './brands';

const BASE = process.env.BITREFILL_API_BASE || 'https://api.bitrefill.com/v2';

export function bitrefillConfigured() {
  return Boolean(
    process.env.BITREFILL_API_KEY ||
      (process.env.BITREFILL_API_ID && process.env.BITREFILL_API_SECRET)
  );
}

function authHeader() {
  if (process.env.BITREFILL_API_ID && process.env.BITREFILL_API_SECRET) {
    const raw = `${process.env.BITREFILL_API_ID}:${process.env.BITREFILL_API_SECRET}`;
    return `Basic ${Buffer.from(raw).toString('base64')}`;
  }
  return `Bearer ${process.env.BITREFILL_API_KEY}`;
}

async function call(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.message || body?.error || `Bitrefill error ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// Normalise a Bitrefill product into the shape the app uses.
function shape(p) {
  return {
    id: p.id,
    name: p.name,
    country: p.country || p.country_code || '',
    currency: p.currency || 'USD',
    image: p.image || p.logo_image || null,
    domain: domainFor(p.name),
    category: brandFor(p.name)?.cat || null,
    packages: Array.isArray(p.packages)
      ? p.packages.map((k) => ({ id: k.package_id ?? k.id, value: Number(k.value) })).filter((k) => Number.isFinite(k.value)).sort((a, b) => a.value - b.value)
      : [],
    range: p.range ? { min: Number(p.range.min), max: Number(p.range.max), step: Number(p.range.step || 1) } : null,
  };
}

// US first, then everything else, so people see cards they can use.
function rank(list, country) {
  const want = (country || 'US').toUpperCase();
  return [...list].sort((a, b) => Number((b.country || '').toUpperCase() === want) - Number((a.country || '').toUpperCase() === want));
}

async function rawSearch(q, limit = 24) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (process.env.BITREFILL_TEST_PRODUCTS === 'true') params.set('include_test_products', 'true');
  const body = await call(`/products/search?${params}`);
  return (body?.data?.data || body?.data || []).map(shape);
}

// The opening shelf: one card per well-known brand, cached for an hour.
// Searches run 8 at a time to stay well inside Bitrefill's rate limits.
let shelf = { at: 0, country: '', items: [] };
async function popularProducts(country) {
  const want = (country || 'US').toUpperCase();
  if (shelf.items.length && shelf.country === want && Date.now() - shelf.at < 3600_000) return shelf.items;
  const results = [];
  for (let i = 0; i < POPULAR_BRANDS.length; i += 8) {
    const batch = POPULAR_BRANDS.slice(i, i + 8);
    results.push(...(await Promise.allSettled(batch.map((b) => rawSearch(b.q, 12)))));
  }
  const seen = new Set();
  const items = [];
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    const b = POPULAR_BRANDS[i];
    const pick = r.value.find((p) => matches(b, p.name) && (p.country || '').toUpperCase() === want && !seen.has(p.id));
    if (pick) { seen.add(pick.id); items.push({ ...pick, domain: b.domain, category: b.cat, top: Boolean(b.top) }); }
  });
  if (items.length) shelf = { at: Date.now(), country: want, items };
  return items;
}

export async function searchProducts(q, country) {
  if (!bitrefillConfigured()) {
    const needle = (q || '').toLowerCase();
    return DEMO_PRODUCTS.filter((p) => !needle || p.name.toLowerCase().includes(needle)).map((p) => { const b = brandFor(p.name); return { ...p, domain: b?.domain || null, category: b?.cat || null, top: Boolean(b?.top) }; });
  }
  if (!q) {
    const items = await popularProducts(country);
    if (items.length) return items;
  }
  return rank(await rawSearch(q || 'gift card'), country);
}

export async function getProduct(id) {
  if (!bitrefillConfigured()) return DEMO_PRODUCTS.find((p) => p.id === id) || null;
  const body = await call(`/products/${encodeURIComponent(id)}`);
  return body?.data ? shape(body.data) : null;
}

// Creates an invoice the buyer pays directly in USDC on Solana.
// GIFTED never holds the buyer's money: the swap sends USDC straight to Bitrefill.
export async function createInvoice({ productId, packageId, value, refundAddress, webhookUrl }) {
  const item = { product_id: productId, quantity: 1 };
  if (packageId) item.package_id = packageId;
  else item.value = value;
  const body = await call('/invoices', {
    method: 'POST',
    body: JSON.stringify({
      products: [item],
      payment_method: 'usdc_solana',
      refund_address: refundAddress,
      ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
    }),
  });
  const inv = body?.data || body;
  return {
    id: inv.id,
    status: inv.status,
    payTo: inv.payment?.address,
    price: inv.payment?.price,
    currency: inv.payment?.currency,
  };
}

// The payment details of an invoice, read back from Bitrefill (never trusted from the browser).
export async function getInvoicePayment(id) {
  const body = await call(`/invoices/${encodeURIComponent(id)}`);
  const inv = body?.data || body;
  return {
    id: inv.id,
    status: inv.status,
    payTo: inv.payment?.address,
    price: inv.payment?.price,
    currency: inv.payment?.currency,
    method: inv.payment_method || inv.payment?.method || null,
  };
}

export async function getInvoice(id) {
  const body = await call(`/invoices/${encodeURIComponent(id)}`);
  const inv = body?.data || body;
  const orderIds = (inv.orders || []).map((o) => o.id).filter(Boolean);
  let redemption = null;
  if (inv.status === 'complete' && orderIds[0]) {
    const order = await call(`/orders/${encodeURIComponent(orderIds[0])}`);
    redemption = order?.data?.redemption_info || null;
  }
  return { id: inv.id, status: inv.status, redemption };
}
