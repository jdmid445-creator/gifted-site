'use client';

// Hero object: a stack of two gifted gift cards, drawn in CSS so it stays crisp at any size.
// Click the front card and it spins all the way around, then settles back.
import { useState } from 'react';
import Mascot from './Mascot';

const SHADOW = '0 1px 0 rgba(255,255,255,.16) inset, 0 0 0 1px rgba(255,255,255,.07) inset, 0 34px 60px -24px rgba(0,0,0,.85), 0 2px 8px rgba(0,0,0,.4)';
const SIZE = { width: 320, height: 202, borderRadius: 18 };
const RIBBON = { position: 'absolute', top: 0, bottom: 0, left: 250, width: 16 };

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
      <div aria-hidden="true" className="gc gc-back" style={{ '--r': '7deg', position: 'absolute', left: 52, top: 18, zIndex: 1, ...SIZE, overflow: 'hidden', background: 'linear-gradient(150deg, #E25A7D 0%, #C9305A 100%)', boxShadow: SHADOW }}>
        <div style={{ ...RIBBON, background: 'rgba(255,255,255,.2)' }} />
      </div>

      {/* front card: two faces so the spin shows the back */}
      <button
        type="button"
        onClick={spin}
        aria-label="Spin the gift card"
        className="gc gc-front"
        style={{ '--r': '-5deg', position: 'absolute', left: 10, top: 66, zIndex: 2, ...SIZE, padding: 0, border: 0, background: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left' }}
      >
        <span className={`gc-spin${spinning ? ' is-spinning' : ''}`}>
          <span className="gc-face" style={{ background: 'linear-gradient(155deg, #34343A 0%, #1B1B1E 45%, #0F0F11 100%)', boxShadow: SHADOW }}>
            <span className="gc-shine" />
            <span style={{ ...RIBBON, background: 'linear-gradient(180deg, #E25A7D, #B92A52)' }} />
            <span style={{ position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mascot size={26} variant="icon" title="" />
              <span style={{ font: '600 18px var(--display)', letterSpacing: '-0.04em' }}>gifted</span>
            </span>
            <span style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '500 12px var(--display)', color: 'rgba(255,255,255,.55)' }}>Gift card</span>
              <span style={{ font: '500 26px var(--display)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>$50.00</span>
            </span>
          </span>
          <span className="gc-face gc-face-back" style={{ background: 'linear-gradient(205deg, #2E2E33 0%, #161618 55%, #0F0F11 100%)', boxShadow: SHADOW }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: 26, height: 38, background: '#050506' }} />
            <span style={{ position: 'absolute', left: 20, top: 82, width: 170, height: 30, borderRadius: 6, background: 'repeating-linear-gradient(90deg, #EDEDEF 0 6px, #D9D9DE 6px 12px)', opacity: 0.9 }} />
            <span style={{ position: 'absolute', left: 20, bottom: 18, font: '500 12px var(--display)', color: 'rgba(255,255,255,.5)' }}>Paid with crypto</span>
            <span style={{ position: 'absolute', right: 18, bottom: 14 }}><Mascot size={30} variant="icon" title="" /></span>
          </span>
        </span>
      </button>
    </div>
  );
}
