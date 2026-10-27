// Brands people actually buy, grouped so the shop is easy to browse.
// `q` is what we search Bitrefill for; `name` must appear in the product name as a whole word;
// `not` rules out look-alikes ("Uber" vs "Uber Eats"); `domain` gives a logo when Bitrefill's
// own image isn't available; `top` puts it on the opening "Popular" shelf.
export const CATEGORIES = ['Popular', 'Food', 'Gaming', 'Shopping', 'Travel', 'Streaming', 'Fun'];

const B = (cat, q, domain, extra = {}) => ({ cat, q, name: extra.name || q, domain, ...extra });

export const POPULAR_BRANDS = [
  // Food & delivery
  B('Food', 'DoorDash', 'doordash.com', { top: true }),
  B('Food', 'Uber Eats', 'ubereats.com', { top: true }),
  B('Food', 'Grubhub', 'grubhub.com'),
  B('Food', 'Instacart', 'instacart.com'),
  B('Food', 'Chipotle', 'chipotle.com', { top: true }),
  B('Food', 'Starbucks', 'starbucks.com', { top: true }),
  B('Food', "Dunkin'", 'dunkindonuts.com', { name: 'dunkin' }),
  B('Food', "Domino's", 'dominos.com', { name: 'domino' }),
  B('Food', "Papa John's", 'papajohns.com', { name: 'papa john' }),
  B('Food', 'Panera', 'panerabread.com'),
  B('Food', 'Subway', 'subway.com'),
  B('Food', 'Taco Bell', 'tacobell.com'),
  B('Food', 'Chick-fil-A', 'chick-fil-a.com', { name: 'chick-fil-a' }),
  B('Food', 'Shake Shack', 'shakeshack.com'),
  B('Food', 'Sweetgreen', 'sweetgreen.com'),
  B('Food', 'Wingstop', 'wingstop.com'),
  B('Food', "Applebee's", 'applebees.com', { name: 'applebee' }),
  B('Food', 'Olive Garden', 'olivegarden.com'),
  B('Food', 'Buffalo Wild Wings', 'buffalowildwings.com'),
  B('Food', 'Texas Roadhouse', 'texasroadhouse.com'),
  B('Food', 'Cheesecake Factory', 'thecheesecakefactory.com'),
  B('Food', 'Krispy Kreme', 'krispykreme.com'),
  B('Food', 'Whole Foods', 'wholefoodsmarket.com'),

  // Gaming
  B('Gaming', 'PlayStation', 'playstation.com', { top: true }),
  B('Gaming', 'Xbox', 'xbox.com', { top: true }),
  B('Gaming', 'Nintendo', 'nintendo.com', { top: true }),
  B('Gaming', 'Steam', 'steampowered.com', { top: true }),
  B('Gaming', 'Roblox', 'roblox.com', { top: true }),
  B('Gaming', 'Fortnite', 'fortnite.com'),
  B('Gaming', 'Valorant', 'playvalorant.com'),
  B('Gaming', 'League of Legends', 'leagueoflegends.com'),
  B('Gaming', 'Call of Duty', 'callofduty.com'),
  B('Gaming', 'Minecraft', 'minecraft.net'),
  B('Gaming', 'EA', 'ea.com', { name: 'ea play' }),
  B('Gaming', 'Battle.net', 'blizzard.com', { name: 'battle.net' }),
  B('Gaming', 'Razer Gold', 'razer.com'),
  B('Gaming', 'GameStop', 'gamestop.com'),
  B('Gaming', 'Twitch', 'twitch.tv'),
  B('Gaming', 'Apex Legends', 'ea.com', { name: 'apex' }),
  B('Gaming', 'Genshin Impact', 'hoyoverse.com', { name: 'genshin' }),
  B('Gaming', 'PUBG', 'pubg.com'),
  B('Gaming', 'Free Fire', 'ff.garena.com'),

  // Shopping
  B('Shopping', 'Amazon', 'amazon.com', { top: true }),
  B('Shopping', 'Apple', 'apple.com', { top: true }),
  B('Shopping', 'Target', 'target.com', { top: true }),
  B('Shopping', 'Walmart', 'walmart.com', { top: true }),
  B('Shopping', 'Nike', 'nike.com', { top: true }),
  B('Shopping', 'Adidas', 'adidas.com'),
  B('Shopping', 'Foot Locker', 'footlocker.com'),
  B('Shopping', 'Best Buy', 'bestbuy.com'),
  B('Shopping', 'Home Depot', 'homedepot.com'),
  B('Shopping', "Lowe's", 'lowes.com', { name: 'lowe' }),
  B('Shopping', 'IKEA', 'ikea.com'),
  B('Shopping', 'Sephora', 'sephora.com'),
  B('Shopping', 'Ulta', 'ulta.com'),
  B('Shopping', "Macy's", 'macys.com', { name: 'macy' }),
  B('Shopping', 'Nordstrom', 'nordstrom.com'),
  B('Shopping', 'TJ Maxx', 'tjmaxx.com', { name: 'tj ?maxx' }),
  B('Shopping', 'Old Navy', 'oldnavy.com'),
  B('Shopping', 'Gap', 'gap.com'),
  B('Shopping', 'H&M', 'hm.com', { name: 'h&m' }),
  B('Shopping', 'Lululemon', 'lululemon.com'),
  B('Shopping', 'Bath & Body Works', 'bathandbodyworks.com', { name: 'bath & body' }),
  B('Shopping', "Victoria's Secret", 'victoriassecret.com', { name: 'victoria' }),
  B('Shopping', "Dick's Sporting Goods", 'dickssportinggoods.com', { name: "dick'?s" }),
  B('Shopping', 'eBay', 'ebay.com'),
  B('Shopping', 'Etsy', 'etsy.com'),
  B('Shopping', 'Wayfair', 'wayfair.com'),
  B('Shopping', 'Barnes & Noble', 'barnesandnoble.com', { name: 'barnes' }),
  B('Shopping', 'CVS', 'cvs.com'),
  B('Shopping', 'Walgreens', 'walgreens.com'),
  B('Shopping', 'Shein', 'shein.com'),

  // Travel & rides
  B('Travel', 'Uber', 'uber.com', { top: true, not: 'eats' }),
  B('Travel', 'Lyft', 'lyft.com'),
  B('Travel', 'Airbnb', 'airbnb.com', { top: true }),
  B('Travel', 'Hotels.com', 'hotels.com'),
  B('Travel', 'Expedia', 'expedia.com'),
  B('Travel', 'Southwest', 'southwest.com'),
  B('Travel', 'Delta', 'delta.com'),
  B('Travel', 'Marriott', 'marriott.com'),
  B('Travel', 'Carnival', 'carnival.com'),
  B('Travel', 'Royal Caribbean', 'royalcaribbean.com'),

  // Streaming & apps
  B('Streaming', 'Netflix', 'netflix.com', { top: true }),
  B('Streaming', 'Spotify', 'spotify.com', { top: true }),
  B('Streaming', 'Hulu', 'hulu.com'),
  B('Streaming', 'Disney+', 'disneyplus.com', { name: 'disney' }),
  B('Streaming', 'Google Play', 'play.google.com'),
  B('Streaming', 'YouTube', 'youtube.com'),
  B('Streaming', 'Paramount+', 'paramountplus.com', { name: 'paramount' }),
  B('Streaming', 'Audible', 'audible.com'),
  B('Streaming', 'Xbox Game Pass', 'xbox.com', { name: 'game pass' }),
  B('Streaming', 'PlayStation Plus', 'playstation.com', { name: 'playstation plus' }),

  // Fun & going out
  B('Fun', 'AMC Theatres', 'amctheatres.com', { name: 'amc' }),
  B('Fun', 'Fandango', 'fandango.com'),
  B('Fun', 'Regal', 'regmovies.com'),
  B('Fun', 'StubHub', 'stubhub.com'),
  B('Fun', 'Ticketmaster', 'ticketmaster.com'),
  B('Fun', "Dave & Buster's", 'daveandbusters.com', { name: 'dave & buster' }),
  B('Fun', 'Topgolf', 'topgolf.com'),
  B('Fun', 'Live Nation', 'livenation.com'),
];

// Whole-word match on the product name, so "Apple" never picks up "Applebee's".
export function matches(brand, productName = '') {
  const n = productName.toLowerCase();
  const pattern = brand.name.toLowerCase().replace(/[.*+^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^a-z])${pattern}([^a-z]|$)`);
  if (!re.test(n)) return false;
  if (brand.not && n.includes(brand.not)) return false;
  return true;
}

// Logo domain + category for any product name.
const BY_LENGTH = [...POPULAR_BRANDS].sort((a, b) => b.name.length - a.name.length);
export function brandFor(name = '') {
  return BY_LENGTH.find((b) => matches(b, name)) || null;
}
export function domainFor(name = '') {
  return brandFor(name)?.domain || null;
}
