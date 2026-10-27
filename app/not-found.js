import Link from 'next/link';
import Mascot from '@/components/Mascot';

export default function NotFound() {
  return (
    <section className="wrap" style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
      <Mascot size={200} title="The gifted creature peeking out of an empty box" />
      <h1 style={{ margin: 0, font: '600 40px var(--display)' }}>Nothing in this box.</h1>
      <p className="muted" style={{ margin: 0 }}>That page doesn’t exist.</p>
      <Link href="/" className="btn btn-primary">Back home</Link>
    </section>
  );
}
