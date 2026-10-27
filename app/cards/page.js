import MyCards from '@/components/MyCards';

export const metadata = { title: 'My cards' };

export default function CardsPage() {
  return (
    <section className="wrap" style={{ padding: '48px 20px', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, font: '500 40px var(--display)', letterSpacing: '-0.03em' }}>My cards</h1>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>Gift cards you’ve bought on this device. Treat codes like cash.</p>
      </div>
      <MyCards />
    </section>
  );
}
