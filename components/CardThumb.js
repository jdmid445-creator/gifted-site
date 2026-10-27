'use client';

import { useState } from 'react';

// A small gift-card-shaped thumbnail. Tries, in order: Bitrefill's product image,
// the brand's logo (from its website), then a plain card in a tone picked from the name.
const TONES = ['#3A3A40', '#2F5A49', '#3F4682', '#7E3A52', '#6E5730', '#2E5A72', '#5A4478', '#7A3434'];

export function toneFor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

const isUrl = (u) => typeof u === 'string' && /^https?:\/\//.test(u);
const logoUrl = (domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

export default function CardThumb({ name = '', image = null, domain = null, width = 40 }) {
  const [step, setStep] = useState(isUrl(image) ? 0 : domain ? 1 : 2);
  const height = Math.round(width / 1.586);
  const radius = Math.max(4, width / 9);
  const base = { width, height, borderRadius: radius, flex: 'none', display: 'block' };
  const next = () => setStep((s) => (s === 0 && domain ? 1 : 2));

  if (step === 0) {
    return <img src={`/api/icon?u=${encodeURIComponent(image)}`} alt="" width={width} height={height} loading="lazy" referrerPolicy="no-referrer" onError={next}
      style={{ ...base, objectFit: 'cover', background: '#fff', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)' }} />;
  }
  if (step === 1) {
    const s = Math.round(height * 0.62);
    return (
      <span aria-hidden="true" style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F4F5', boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.08)' }}>
        <img src={logoUrl(domain)} alt="" width={s} height={s} loading="lazy" referrerPolicy="no-referrer" onError={next} style={{ width: s, height: s, objectFit: 'contain', borderRadius: 3 }} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={{ ...base, position: 'relative', overflow: 'hidden', background: toneFor(name), boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.06)' }}>
      <span style={{ position: 'absolute', top: 0, bottom: 0, left: '68%', width: Math.max(2, width / 14), background: 'rgba(255,255,255,.22)' }} />
      <span style={{ position: 'absolute', left: Math.max(4, width / 9), bottom: Math.max(3, width / 12), width: width / 3, height: Math.max(2, width / 20), borderRadius: 2, background: 'rgba(255,255,255,.55)' }} />
    </span>
  );
}
