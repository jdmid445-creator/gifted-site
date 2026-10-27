import FreshWallet from '@/components/FreshWallet';

export const metadata = { title: 'Fresh wallet', robots: { index: false } };

export default function FreshWalletPage() {
  return (
    <section className="wrap" style={{ padding: '56px 20px', maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h1 style={{ margin: 0, font: '500 44px/1.05 var(--display)', letterSpacing: '-0.03em' }}>Get a fresh wallet</h1>
        <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
          A new wallet has no history, so nothing links it back to you. Use it as your backup address and the shop never sees your main wallet.
        </p>
      </div>
      <FreshWallet />
    </section>
  );
}
