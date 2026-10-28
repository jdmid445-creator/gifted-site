// The live feed. Every paid order on the Bitrefill account shows here, read straight from Bitrefill,
// so nothing depends on the buyer's browser staying open. Wallets are never sent to the browser:
// the feed shows what was bought, how much and roughly when. The masked "wallet" a row shows is
// made up from the invoice id, never the buyer's address.
import { listInvoices, productName } from './bitrefill';

const PAID = /complete|delivered|payment_confirmed|payment_detected|processing|paid/;

function maskFor(id) {
  // A stable, fake address-like string per invoice (for the blurred chip), unrelated to any wallet.
  const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let h = 2166136261;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let out = '';
  for (let i = 0; i < 8; i++) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; out += A[h % A.length]; }
  return `${out.slice(0, 4)}…${out.slice(4)}`;
}

const ts = (v) => { const n = typeof v === 'number' ? (v < 1e12 ? v * 1000 : v) : Date.parse(v || ''); return Number.isFinite(n) ? n : null; };

let cache = { at: 0, rows: [] };

export async function readFeed(limit = 20) {
  if (Date.now() - cache.at < 10_000) return cache.rows.slice(0, limit);
  const invoices = await listInvoices(50);
  const rows = [];
  for (const inv of invoices) {
    const status = String(inv.status || '').toLowerCase();
    if (!PAID.test(status) || /unpaid|not_delivered|expired|denied|error|fail|refund/.test(status)) continue;
    const item = (inv.products || inv.items || [])[0] || {};
    const pid = item.product_id || item.productId || item.id || inv.product_id;
    const pkg = String(item.package_id || item.packageId || '');
    const value = Number(item.value ?? item.package_value ?? (pkg.includes('<&>') ? pkg.split('<&>')[1] : NaN));
    rows.push({
      id: String(inv.id || '').slice(0, 8),
      name: item.product_name || item.name || (await productName(pid)) || 'Gift card',
      value: Number.isFinite(value) ? value : null,
      currency: item.currency || inv.currency || 'USD',
      at: Math.floor((ts(inv.created_time || inv.created_at || inv.createdAt || inv.updated_time) || Date.now()) / 300000) * 300000,
      wallet: maskFor(inv.id),
    });
    if (rows.length >= 30) break;
  }
  rows.sort((a, b) => b.at - a.at);
  cache = { at: Date.now(), rows };
  return rows.slice(0, limit);
}

// Kept so older callers still work; the feed no longer needs anything recorded.
export async function recordOrder() {}
export const feedConfigured = () => true;
