'use client';

import { useEffect, useState } from 'react';

// A scannable QR code for a deposit address. Generated in the browser (no third party sees the address).
// Dark modules on white, with a quiet margin, so every wallet and exchange scanner can read it.
export default function QrCode({ value, size = 168, label = 'Scan to copy the address' }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((QR) => QR.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0c0a18', light: '#ffffff' } }))
      .then((s) => { if (alive) setSvg(s); })
      .catch(() => { if (alive) setSvg(''); });
    return () => { alive = false; };
  }, [value]);
  if (!value) return null;
  return (
    <figure className="qr" style={{ '--qr': `${size}px` }}>
      <div className="qr-box" role="img" aria-label={`QR code for ${value}`} dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}
