// Hero object: a stack of two gifted gift cards, drawn in CSS so it stays crisp at any size.
import Mascot from './Mascot';

function Face({ tone, ink, rotate, x, y, children, z, className }) {
  return (
    <div className={className} style={{ '--r': `${rotate}deg`,
      position: 'absolute', left: x, top: y, width: 320, height: 202, borderRadius: 18, zIndex: z,
      background: tone, color: ink,
      boxShadow: '0 1px 0 rgba(255,255,255,.16) inset, 0 0 0 1px rgba(255,255,255,.07) inset, 0 34px 60px -24px rgba(0,0,0,.85), 0 2px 8px rgba(0,0,0,.4)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

export default function GiftCardArt() {
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: 380, height: 280, flex: 'none' }}>
      <Face tone="linear-gradient(150deg, #E25A7D 0%, #C9305A 100%)" ink="#fff" rotate={7} x={52} y={18} z={1} className="gc gc-back">
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 250, width: 16, background: 'rgba(255,255,255,.2)' }} />
      </Face>
      <Face tone="linear-gradient(155deg, #34343A 0%, #1B1B1E 45%, #0F0F11 100%)" ink="#fff" rotate={-5} x={10} y={66} z={2} className="gc gc-front">
        <div className="gc-shine" />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 250, width: 16, background: 'linear-gradient(180deg, #E25A7D, #B92A52)' }} />
        <div style={{ position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mascot size={26} variant="icon" title="" />
          <span style={{ font: '600 18px var(--display)', letterSpacing: '-0.04em' }}>gifted</span>
        </div>
        <div style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ font: '400 11px var(--mono)', color: 'rgba(255,255,255,.55)' }}>Gift card</span>
          <span style={{ font: '500 26px var(--display)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>$50.00</span>
        </div>
        <span style={{ position: 'absolute', left: 140, bottom: 23, font: '400 12px var(--mono)', color: 'rgba(255,255,255,.6)', letterSpacing: '.04em' }}>•••• 7Q2M</span>
      </Face>
    </div>
  );
}
