import Link from 'next/link';
import Mascot from './Mascot';
import { site } from '@/lib/site';

export default function Footer() {
  const social = [
    ['X', site.links.x],
    ['Telegram', site.links.telegram],
    ['pump.fun', site.links.pumpfun],
    ['DEX Screener', site.links.dexscreener],
  ].filter(([, href]) => href);

  const cols = [
    ['Product', [['Shop', '/#shop'], ['Live orders', '/#live'], ['My cards', '/cards']]],
    ['Learn', [['Docs', '/docs'], ['Private checkout', '/docs#private'], ['Fees', '/docs#fees']]],
    ['Legal', [['Terms', '/terms'], ['Privacy', '/privacy']]],
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', marginTop: 40 }}>
      <div className="wrap" style={{ padding: '48px 20px 36px', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mascot size={30} variant="icon" title="" />
            <span style={{ font: '600 20px var(--display)', letterSpacing: '-0.04em' }}>GiftedSwaps</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
            GiftedSwaps lets you buy gift cards with crypto without tying the purchase to your wallet. $GIFTED is a meme coin with no promised value or returns. The shop is free to use, and holding $GIFTED isn’t required.
            Gift cards are fulfilled through Bitrefill. GiftedSwaps never holds your funds: you approve every payment from your own wallet.
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>Card photo by <a href="https://unsplash.com/photos/black-business-credit-card-ahjzVINkuCs" target="_blank" rel="noopener noreferrer">Unsplash</a>, retouched.</p>
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', gap: 48, flexWrap: 'wrap', fontSize: 14 }}>
          {cols.map(([title, links]) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label">{title}</span>
              {links.map(([l, h]) => <Link key={h} href={h} style={{ textDecoration: 'none' }}>{l}</Link>)}
            </div>
          ))}
          {social.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label">Community</span>
              {social.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{l}</a>)}
            </div>
          )}
        </nav>
      </div>
    </footer>
  );
}
