'use client';

import { useEffect, useRef, useState } from 'react';
import { toneFor } from './CardThumb';

// Known-good fallbacks for the majors, from the Solana token list.
const TL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet';
const FALLBACK = {
  So11111111111111111111111111111111111111112: `${TL}/So11111111111111111111111111111111111111112/logo.png`,
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: `${TL}/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png`,
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: `${TL}/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg`,
};

export const relay = (u) => `/api/icon?u=${encodeURIComponent(u)}`;

export default function TokenIcon({ mint, icon, symbol, size = 32 }) {
  const sources = [icon, FALLBACK[mint]].filter(Boolean).flatMap((u) => [relay(u), u]);
  const [i, setI] = useState(0);
  const ref = useRef(null);
  // An image that failed before React hydrated never fires onError; catch that case too.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setI((n) => n + 1);
  }, [i]);
  if (i < sources.length) {
    return (
      <img ref={ref} key={sources[i]} src={sources[i]} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer"
        onError={() => setI((n) => n + 1)}
        style={{ width: size, height: size, borderRadius: '50%', flex: 'none', objectFit: 'cover', background: '#1E1E21' }} />
    );
  }
  return (
    <span aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', flex: 'none', background: toneFor(symbol), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `500 ${Math.round(size * 0.4)}px var(--mono)` }}>
      {(symbol || '?').slice(0, 1)}
    </span>
  );
}
