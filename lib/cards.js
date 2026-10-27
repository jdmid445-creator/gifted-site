// Gift cards the buyer has paid for, kept only in their own browser.
const STORE_KEY = 'gifted.cards.v1';

export function loadCards() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch { return []; }
}

export function saveCards(cards) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(cards.slice(0, 50))); } catch {}
}

export async function fetchCardStatus(card) {
  const res = await fetch(`/api/invoice/${encodeURIComponent(card.id)}?token=${encodeURIComponent(card.token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not check this card');
  return data;
}
