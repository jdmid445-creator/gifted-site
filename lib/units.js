// Decimal string like "25.31" -> base units, rounding UP so a payment is never short.
export function toAtomic(price, decimals = 6) {
  const [whole, frac = ''] = String(price).split('.');
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  let atomic = BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(padded || '0');
  if (frac.length > decimals && /[1-9]/.test(frac.slice(decimals))) atomic += 1n;
  return atomic.toString();
}
