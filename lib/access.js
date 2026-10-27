// Gift card codes must only ever reach the person who paid.
// When an invoice is created we hand the buyer a signed access token;
// the status endpoint refuses to return a code without it.
import crypto from 'crypto';

function secret() {
  const s = process.env.GIFTED_SECRET;
  if (!s || s.length < 32) throw new Error('GIFTED_SECRET must be set (32+ random characters)');
  return s;
}

export function signInvoice(id) {
  return crypto.createHmac('sha256', secret()).update(String(id)).digest('base64url');
}

export function checkInvoiceToken(id, token) {
  if (!token) return false;
  const expected = Buffer.from(signInvoice(id));
  const given = Buffer.from(String(token));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
