// Server-only Bitrefill client. Credentials never reach the browser.
// Personal API key  -> BITREFILL_API_KEY            (Bearer, for testing)
// Business/Affiliate -> BITREFILL_API_ID + _SECRET   (Basic, for launch)
import { DEMO_PRODUCTS } from './demo';

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
    packages: Array.isArray(p.packages)
      ? p.packages.map((k) => ({ id: k.package_id ?? k.id, value: Number(k.value) }))
      : [],
    range: p.range ? { min: Number(p.range.min), max: Number(p.range.max), step: Number(p.range.step || 1) } : null,
  };
}

export async function searchProducts(q, country) {
  if (!bitrefillConfigured()) {
    const needle = (q || '').toLowerCase();
    return DEMO_PRODUCTS.filter((p) => !needle || p.name.toLowerCase().includes(needle));
  }
  const params = new URLSearchParams({ q: q || 'gift', limit: '24' });
  if (process.env.BITREFILL_TEST_PRODUCTS === 'true') params.set('include_test_products', 'true');
  const body = await call(`/products/search?${params}`);
  const list = body?.data?.data || body?.data || [];
  return list
    .map(shape)
    .filter((p) => !country || !p.country || p.country.toUpperCase() === country.toUpperCase());
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
