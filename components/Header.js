import Link from 'next/link';
import Mascot from './Mascot';
import { CaPill, WalletButton } from './HeaderClient';
import { IconX } from './Icons';
import { site } from '@/lib/site';

const nav = [
  ['Shop', '/#shop'],
  ['Live orders', '/#live'],
  ['Docs', '/docs'],
  ['My cards', '/cards'],
];

export default function Header() {
  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(11,11,12,.78)', backdropFilter: 'saturate(1.4) blur(12px)', borderBottom: '1px solid var(--line)' }}>
      <div className="hdr">
        <Link href="/" aria-label="gifted home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Mascot size={32} variant="icon" title="" />
          <span style={{ font: '600 21px var(--display)', letterSpacing: '-0.03em' }}>gifted</span>
        </Link>
        <nav aria-label="Main" className="hdr-nav">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link hdr-link">{label}</Link>
          ))}
          {site.links.x ? (
            <a href={site.links.x} target="_blank" rel="noopener noreferrer" className="hdr-link hdr-x" aria-label="gifted on X"><IconX /></a>
          ) : (
            <span className="hdr-link hdr-x" title="X account coming soon" aria-label="X account coming soon" role="img"><IconX /></span>
          )}
          <CaPill ca={site.ca} />
          <span className="hdr-wallet"><WalletButton /></span>
        </nav>
      </div>
    </header>
  );
}
