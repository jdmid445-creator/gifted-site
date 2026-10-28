'use client';

// A coin's logo that never shows up blank: our bundled logo first, then the provider's image
// (through our relay, then direct), and finally a lettered badge in a colour picked from the symbol.
import { useEffect, useRef, useState } from 'react';

const LOCAL = new Set('aave ada algo apt arb atom avax bch bnb btc dai dash doge dot eos etc eth fil ftm hbar icp kas link ltc matic near op pepe shib sol sui trx tusd uni usdc usdt vet xlm xmr xrp xtz zec'.split(' '));
const ALIAS = { wbtc: 'btc', weth: 'eth', wsol: 'sol', pol: 'matic', bsc: 'bnb', 'usdc.e': 'usdc', 'usdt0': 'usdt' };
const TONES = ['#3A3A40', '#2F5A49', '#3F4682', '#7E3A52', '#6E5730', '#2E5A72', '#5A4478', '#7A3434'];
const relay = (u) => `/api/icon?u=${encodeURIComponent(u)}`;

export default function CoinLogo({ symbol = '', icon = null, size = 22 }) {
  const key = String(symbol).replace(/^\$/, '').toLowerCase();
  const local = LOCAL.has(ALIAS[key] || key) ? `/coins/${ALIAS[key] || key}.svg` : null;
  const sources = [local, ...(icon && /^https?:\/\//.test(icon) ? [relay(icon), icon] : [])].filter(Boolean);
  const [i, setI] = useState(0);
  const ref = useRef(null);
  useEffect(() => { setI(0); }, [symbol, icon]);
  useEffect(() => { const el = ref.current; if (el && el.complete && el.naturalWidth === 0) setI((n) => n + 1); }, [i]);

  if (i >= sources.length) {
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return (
      <span aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: TONES[h % TONES.length], color: '#fff', font: `600 ${Math.round(size * 0.42)}px var(--display)` }}>
        {(key[0] || '?').toUpperCase()}
      </span>
    );
  }
  return <img ref={ref} src={sources[i]} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" onError={() => setI((n) => n + 1)} style={{ width: size, height: size, borderRadius: '50%', flex: 'none', objectFit: 'cover' }} />;
}
