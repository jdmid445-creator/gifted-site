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
function shapeBase(p) {
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

// Cards with an open range (PlayStation USD takes anything from $25) also get round amounts
// the fixed list leaves out. Their ids start with "r:" and are bought by value.
const ROUND = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 500];
function shape(p) {
  const out = shapeBase(p);
  if (out.range && Number.isFinite(out.range.min) && Number.isFinite(out.range.max)) {
    const have = new Set(out.packages.map((k) => k.value));
    for (const v of ROUND) if (v >= out.range.min && v <= out.range.max && !have.has(v)) out.packages.push({ id: `r:${v}`, value: v });
    out.packages.sort((a, b) => a.value - b.value);
  }
  return out;
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
  const list = Array.isArray(body?.data?.data) ? body.data.data : Array.isArray(body?.data) ? body.data : [];
  return list.map(shape);
}

// Category shelves ("Popular", "Food", "Gaming"...): one card per well-known brand.
// Each shelf is its own small request (about 20-30 searches, 10 at a time) so it
// finishes well inside the serverless time limit, and is cached for an hour.
const shelves = new Map(); // `${country}:${shelf}` -> { at, items }
const countryOf = (p) => (p.country || (p.name.match(/\(([A-Za-z]{2})\)\s*$/) || [])[1] || '').toUpperCase();

export async function shelfProducts(shelf, country) {
  const want = (country || 'US').toUpperCase();
  const key = `${want}:${shelf}`;
  const cached = shelves.get(key);
  if (cached && Date.now() - cached.at < 3600_000) return cached.items;
  const brands = POPULAR_BRANDS.filter((b) => (shelf === 'Popular' ? b.top : b.cat === shelf));
  if (!bitrefillConfigured()) {
    return DEMO_PRODUCTS.map((p) => ({ ...p, b: brandFor(p.name) }))
      .filter(({ b }) => b && (shelf === 'Popular' ? b.top : b.cat === shelf))
      .map(({ b, ...p }) => ({ ...p, domain: b.domain, category: b.cat }));
  }
  const results = [];
  for (let i = 0; i < brands.length; i += 10) {
    const batch = brands.slice(i, i + 10);
    results.push(...(await Promise.allSettled(batch.map((b) => rawSearch(b.q, 12)))));
  }
  const seen = new Set();
  const items = [];
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    const b = brands[i];
    const pick = r.value.find((p) => matches(b, p.name) && countryOf(p) === want && !seen.has(p.id));
    if (pick) { seen.add(pick.id); items.push({ ...pick, domain: b.domain, category: b.cat }); }
  });
  if (items.length) shelves.set(key, { at: Date.now(), items });
  return items;
}

export async function searchProducts(q, country) {
  if (!bitrefillConfigured()) {
    const needle = (q || '').toLowerCase();
    return DEMO_PRODUCTS.filter((p) => !needle || p.name.toLowerCase().includes(needle)).map((p) => ({ ...p, domain: domainFor(p.name) }));
  }
  return rank(await rawSearch(q || 'gift card'), country);
}

export async function getProduct(id) {
  if (!bitrefillConfigured()) return DEMO_PRODUCTS.find((p) => p.id === id) || null;
  const body = await call(`/products/${encodeURIComponent(id)}`);
  return body?.data ? shape(body.data) : null;
}

// Bitrefill reports a USDC payment price in USDC's smallest unit (5 USDC = "5000000").
// Normalise it to a plain decimal string ("5"), so every caller works in whole USDC.
// A decimal string, or a number too small to be base units, is already in USDC.
export function usdcPrice(raw) {
  if (raw == null || raw === '') return null;
  const str = String(raw).trim();
  if (!/^\d+(\.\d+)?$/.test(str)) return null;
  if (str.includes('.') || Number(str) < 100000) return str; // no gift card costs 100,000 USDC
  const whole = str.slice(0, -6) || '0';
  const frac = str.slice(-6).padStart(6, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole;
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
    price: usdcPrice(inv.payment?.price),
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
    price: usdcPrice(inv.payment?.price),
    currency: inv.payment?.currency,
    method: inv.payment_method || inv.payment?.method || null,
  };
}

export async function getInvoice(id) {
  const body = await call(`/invoices/${encodeURIComponent(id)}`);
  const inv = body?.data || body;
  const raw = String(inv.status || '').toLowerCase();
  const orderIds = (inv.orders || []).map((o) => o.id).filter(Boolean);

  // Bitrefill's invoice status words vary ("complete", "all_delivered", ...), so the order itself decides:
  // a redemption code attached means the card is ready.
  let redemption = null;
  let orderStatus = '';
  const mayHaveCode = !/unpaid|expired|denied|payment_error|cancel/.test(raw);
  if (mayHaveCode && orderIds[0]) {
    const order = await call(`/orders/${encodeURIComponent(orderIds[0])}`).catch(() => null);
    const o = order?.data || order || {};
    orderStatus = String(o.status || '').toLowerCase();
    const info = o.redemption_info || null;
    if (info && (info.code || info.link || info.pin || info.instructions)) redemption = info;
  }

  let status;
  if (redemption) status = 'complete';
  else if (/denied|payment_error|expired|cancel|refund|fail/.test(raw) || /fail|refund/.test(orderStatus)) status = 'failed';
  else if (/unpaid|not_delivered|created|pending|waiting/.test(raw) && !/paid|confirm|detect|process/.test(orderStatus)) status = 'unpaid';
  else status = 'processing';

  return { id: inv.id, status, rawStatus: raw, redemption };
}

// Recent invoices on the account, newest first: the source of truth for the live feed.
export async function listInvoices(limit = 50) {
  const body = await call(`/invoices?limit=${Math.min(100, Math.max(1, limit))}`);
  const rows = body?.data || body?.invoices || body;
  return Array.isArray(rows) ? rows : [];
}

const nameCache = new Map();
// A product's display name, from the invoice if it carries one, else the catalog (cached).
export async function productName(id) {
  if (!id) return null;
  if (nameCache.has(id)) return nameCache.get(id);
  const p = await getProduct(id).catch(() => null);
  const name = p?.name || id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  nameCache.set(id, name);
  return name;
}
