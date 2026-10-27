import Link from 'next/link';
import Mascot from './Mascot';
import { CaPill, WalletButton } from './HeaderClient';
import { site } from '@/lib/site';

const nav = [
  ['Shop', '/#shop'],
  ['Live orders', '/#live'],
  ['Docs', '/docs'],
  ['My cards', '/cards'],
];

export default function Header() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.88)', backdropFilter: 'saturate(1.4) blur(12px)', borderBottom: '1.5px solid var(--line)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 68 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" aria-label="gifted home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Mascot size={34} variant="icon" title="" />
            <span style={{ font: '600 22px var(--display)', letterSpacing: '-0.04em' }}>gifted</span>
          </Link>
          <nav aria-label="Main" style={{ display: 'flex', gap: 4 }}>
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="nav-link" style={{ padding: '8px 10px', borderRadius: 8, fontSize: 15, fontWeight: 500, textDecoration: 'none', color: 'var(--muted)' }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CaPill ca={site.ca} />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
