import Link from 'next/link';
import Mascot from './Mascot';

export default function Header() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(14,10,20,.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 70, flexWrap: 'wrap' }}>
        <Link href="/" aria-label="gifted home" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', textDecoration: 'none' }}>
          <Mascot size={38} variant="icon" title="" />
          <span style={{ font: '700 22px var(--display)', letterSpacing: '-0.03em' }}>gifted</span>
        </Link>
        <nav aria-label="Main" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/#how" className="nav-link" style={{ color: 'var(--muted)', textDecoration: 'none' }}>How it works</Link>
          <Link href="/#token" className="nav-link" style={{ color: 'var(--muted)', textDecoration: 'none' }}>$GIFTED</Link>
          <Link href="/cards" style={{ color: 'var(--muted)', textDecoration: 'none' }}>My cards</Link>
          <Link href="/spend" className="btn btn-primary" style={{ minHeight: 44, boxShadow: 'none' }}>Open app</Link>
        </nav>
      </div>
    </header>
  );
}
