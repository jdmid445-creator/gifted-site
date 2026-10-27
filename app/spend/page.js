import Shop from '@/components/Shop';
import LiveFeed from '@/components/LiveFeed';

export const metadata = { title: 'Shop' };

export default function SpendPage() {
  return (
    <section className="wrap" style={{ paddingTop: 36, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h1 style={{ margin: 0, font: '600 clamp(34px, 5vw, 52px)/1 var(--display)', letterSpacing: '-0.04em' }}>
        Any token in. <span className="serif" style={{ color: 'var(--ribbon)' }}>Gift card out.</span>
      </h1>
      <Shop />
      <LiveFeed limit={4} compact />
    </section>
  );
}
