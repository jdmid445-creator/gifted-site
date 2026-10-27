// Brands people actually buy, shown first when the shop opens.
// `q` is what we search Bitrefill for; `match` must appear in the product name;
// `domain` gives a logo when Bitrefill's own image isn't available.
export const POPULAR_BRANDS = [
  { q: 'amazon', match: 'amazon', domain: 'amazon.com' },
  { q: 'nike', match: 'nike', domain: 'nike.com' },
  { q: 'doordash', match: 'doordash', domain: 'doordash.com' },
  { q: 'chipotle', match: 'chipotle', domain: 'chipotle.com' },
  { q: 'uber eats', match: 'uber eats', domain: 'ubereats.com' },
  { q: 'starbucks', match: 'starbucks', domain: 'starbucks.com' },
  { q: 'apple', match: 'apple', domain: 'apple.com' },
  { q: 'target', match: 'target', domain: 'target.com' },
  { q: 'walmart', match: 'walmart', domain: 'walmart.com' },
  { q: 'steam', match: 'steam', domain: 'steampowered.com' },
  { q: 'playstation', match: 'playstation', domain: 'playstation.com' },
  { q: 'xbox', match: 'xbox', domain: 'xbox.com' },
  { q: 'nintendo', match: 'nintendo', domain: 'nintendo.com' },
  { q: 'roblox', match: 'roblox', domain: 'roblox.com' },
  { q: 'airbnb', match: 'airbnb', domain: 'airbnb.com' },
  { q: 'uber', match: 'uber', domain: 'uber.com' },
  { q: 'lyft', match: 'lyft', domain: 'lyft.com' },
  { q: 'netflix', match: 'netflix', domain: 'netflix.com' },
  { q: 'spotify', match: 'spotify', domain: 'spotify.com' },
  { q: 'best buy', match: 'best buy', domain: 'bestbuy.com' },
  { q: 'home depot', match: 'home depot', domain: 'homedepot.com' },
  { q: 'sephora', match: 'sephora', domain: 'sephora.com' },
  { q: 'dominos', match: 'domino', domain: 'dominos.com' },
  { q: 'grubhub', match: 'grubhub', domain: 'grubhub.com' },
];

// Best-guess logo domain for any product name (used for the fallback logo).
export function domainFor(name = '') {
  const n = name.toLowerCase();
  // longest match first so "uber eats" wins over "uber"
  const hit = [...POPULAR_BRANDS].sort((a, b) => b.match.length - a.match.length).find((b) => n.includes(b.match));
  return hit?.domain || null;
}

export const QUICK_PICKS = ['Nike', 'DoorDash', 'Chipotle', 'Starbucks', 'Amazon', 'Steam', 'Uber Eats', 'Apple'];
