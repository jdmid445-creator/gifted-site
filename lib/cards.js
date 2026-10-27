// Gift cards the buyer has paid for, kept only in their own browser.
const STORE_KEY = 'gifted.cards.v1';

export function loadCards() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

export function saveCards(cards) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(cards.slice(0, 50))); } catch {}
}

// Status URL for a saved card. The extra fields let the server add the order to the
// public live feed once it's delivered (private orders send no token or transaction).
export function statusUrl(card) {
  const p = new URLSearchParams({
    token: card.token,
    name: card.name || '',
    value: String(card.value ?? ''),
    currency: card.currency || '',
    mode: card.private ? 'private' : 'standard',
  });
  if (!card.private) {
    if (card.symbol) p.set('symbol', card.symbol);
    if (card.signature) p.set('tx', card.signature);
  }
  return `/api/invoice/${encodeURIComponent(card.id)}?${p}`;
}

export async function fetchCardStatus(card) {
  const res = await fetch(statusUrl(card));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not check this card');
  return data;
}
