import FreshWallet from '@/components/FreshWallet';

export const metadata = { title: 'Fresh wallet', robots: { index: false } };

export default function FreshWalletPage() {
  return (
    <section className="wrap hero" style={{ padding: '64px 20px 72px', maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div className="hero-bg" aria-hidden="true" style={{ opacity: .55 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 className="hero-title" style={{ margin: 0, font: '500 clamp(36px, 5vw, 52px)/1.04 var(--display)', letterSpacing: '-0.03em' }}>
          <span className="line"><span className="line-inner">A fresh wallet. <span className="dim">No history.</span></span></span>
        </h1>
        <p className="muted rise" style={{ '--d': '140ms', margin: 0, fontSize: 17, lineHeight: 1.6, maxWidth: 620 }}>
          Nothing links a brand-new wallet back to you. Use one as your backup address and the shop never sees your main wallet.
        </p>
      </div>
      <FreshWallet />
    </section>
  );
}
