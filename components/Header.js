import Link from 'next/link';
import Logo from './Logo';
import { CaPill } from './HeaderClient';
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
        <a href="/" aria-label="GiftedSwaps home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="hdr-logo-mark"><Logo size={30} title="" /></span>
          <span style={{ font: '600 21px var(--display)', letterSpacing: '-0.03em' }}>GiftedSwaps</span>
        </a>
        <nav aria-label="Main" className="hdr-nav">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link hdr-link">{label}</Link>
          ))}
          {site.links.x ? (
            <a href={site.links.x} target="_blank" rel="noopener noreferrer" className="hdr-link hdr-x" aria-label="GiftedSwaps on X"><IconX /></a>
          ) : (
            <span className="hdr-link hdr-x" title="X account coming soon" aria-label="X account coming soon" role="img"><IconX /></span>
          )}
          <CaPill ca={site.ca} />
        </nav>
      </div>
      {/* phones: the nav links and CA get their own slim row */}
      <nav aria-label="Main" className="hdr-sub">
        {nav.filter(([l]) => l === 'Docs' || l === 'My cards').map(([label, href]) => (
          <Link key={href} href={href} className="hdr-sub-link">{label}</Link>
        ))}
        <CaPill ca={site.ca} compact />
      </nav>
    </header>
  );
}
