// A small gift-card-shaped thumbnail. Uses the brand image from Bitrefill when there is one,
// otherwise a plain card in a muted tone picked from the name (no logos, no letter avatars).
const TONES = ['#1F1B24', '#2F4A3F', '#3B3F63', '#6B3B4A', '#5A4A2E', '#2E4A5A', '#4A3A5A', '#5C2E2E'];

export function toneFor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export default function CardThumb({ name = '', image = null, width = 40 }) {
  const height = Math.round(width / 1.586);
  const base = { width, height, borderRadius: Math.max(4, width / 9), flex: 'none', display: 'block' };
  if (image) {
    return <img src={image} alt="" width={width} height={height} style={{ ...base, objectFit: 'cover', background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }} />;
  }
  return (
    <span aria-hidden="true" style={{ ...base, position: 'relative', overflow: 'hidden', background: toneFor(name), boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)' }}>
      {/* the gift ribbon */}
      <span style={{ position: 'absolute', top: 0, bottom: 0, left: '68%', width: Math.max(2, width / 14), background: 'rgba(255,255,255,.22)' }} />
      <span style={{ position: 'absolute', left: Math.max(4, width / 9), bottom: Math.max(3, width / 12), width: width / 3, height: Math.max(2, width / 20), borderRadius: 2, background: 'rgba(255,255,255,.55)' }} />
    </span>
  );
}
