'use client';

// Hero object: two gifted cards built from a real photographed card (Unsplash, retouched),
// with our logo and value laid on top in CSS.
// Click the front card and it spins all the way around, then settles back.
import { useState } from 'react';
import Mascot from './Mascot';

const SHADOW = '0 1px 0 rgba(255,255,255,.16) inset, 0 0 0 1px rgba(255,255,255,.07) inset, 0 34px 60px -24px rgba(0,0,0,.85), 0 2px 8px rgba(0,0,0,.4)';
const SIZE = { width: 320, height: 202, borderRadius: 18 };

export default function GiftCardArt() {
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1300);
  }

  return (
    <div style={{ position: 'relative', width: 380, height: 280, flex: 'none' }}>
      {/* back card */}
      <div aria-hidden="true" className="gc gc-back" style={{ '--r': '7deg', position: 'absolute', left: 52, top: 18, zIndex: 1, ...SIZE, overflow: 'hidden', background: 'url(/cards/rose.png) center / cover', boxShadow: SHADOW }} />

      {/* front card: two faces so the spin shows the back */}
      <button
        type="button"
        onClick={spin}
        aria-label="Spin the gift card"
        className="gc gc-front"
        style={{ '--r': '-5deg', position: 'absolute', left: 10, top: 66, zIndex: 2, ...SIZE, padding: 0, border: 0, background: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left' }}
      >
        <span className={`gc-spin${spinning ? ' is-spinning' : ''}`}>
          <span className="gc-face" style={{ background: 'url(/cards/front.png) center / cover', boxShadow: SHADOW }}>
            <span className="gc-shine" />
            <span style={{ position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mascot size={26} variant="icon" title="" />
              <span style={{ font: '600 18px var(--display)', letterSpacing: '-0.04em' }}>gifted</span>
            </span>
            <span style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '500 12px var(--display)', color: 'rgba(255,255,255,.55)' }}>Gift card</span>
              <span style={{ font: '500 26px var(--display)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>$50.00</span>
            </span>
          </span>
          <span className="gc-face gc-face-back" style={{ background: 'url(/cards/back.png) center / cover', boxShadow: SHADOW }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: 26, height: 38, background: '#050506' }} />
            <span style={{ position: 'absolute', left: 20, bottom: 18, font: '500 12px var(--display)', color: 'rgba(255,255,255,.5)' }}>Paid with crypto</span>
            <span style={{ position: 'absolute', right: 18, bottom: 14 }}><Mascot size={30} variant="icon" title="" /></span>
          </span>
        </span>
      </button>
    </div>
  );
}
