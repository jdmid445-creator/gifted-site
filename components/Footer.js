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

  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: 40 }}>
      <div className="wrap" style={{ padding: '40px 20px', display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mascot size={32} variant="icon" title="" />
            <span style={{ font: '700 20px var(--display)', letterSpacing: '-0.03em' }}>gifted</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
            $GIFTED is a meme coin with no promised value or returns. The shop is free to use and holding $GIFTED is not required.
            Gift cards are fulfilled through Bitrefill. gifted never holds your funds: you sign every payment from your own wallet.
            Card availability depends on your country.
          </p>
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <span className="label">Product</span>
            <Link href="/spend">Open app</Link>
            <Link href="/cards">My cards</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <span className="label">Legal</span>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          {social.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <span className="label">Community</span>
              {social.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
              ))}
            </div>
          )}
        </nav>
      </div>
    </footer>
  );
}
