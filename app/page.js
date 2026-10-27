import Link from 'next/link';
import Mascot from '@/components/Mascot';
import CopyCA from '@/components/CopyCA';
import { site } from '@/lib/site';

const steps = [
  { n: '01', t: 'Pick a card', d: 'Search thousands of brands for food, games, shopping, travel and phone top-ups.' },
  { n: '02', t: 'Pick any token', d: 'Pay with anything in your Solana wallet, or go Private and pay from Solana, Ethereum, Base, Bitcoin and more.' },
  { n: '03', t: 'Sign once', d: 'One approval swaps your token and pays for the card. Your code appears on screen.' },
];

const features = [
  { t: 'Pay with anything', d: 'Most gift card shops take a short list of coins. gifted swaps whatever you hold into exactly what the card costs.' },
  { t: 'One signature', d: 'The swap and the payment happen in a single transaction. No bridging, no exchange, no extra steps.' },
  { t: 'Never custodial', d: 'Your token goes straight from your wallet to the gift card provider. We never hold your money.' },
  { t: 'Private checkout', d: 'Flip to Private and the shop is paid by the NEAR Intents network instead of your wallet, so the purchase isn’t linked to you on-chain. Pay from Solana, Ethereum, Base, Bitcoin and more.' },
  { t: 'Your code, only yours', d: 'Codes are only shown to the person who paid, and saved in your browser so you can find them later.' },
];

const brands = ['Amazon', 'Uber Eats', 'DoorDash', 'Steam', 'Airbnb', 'PlayStation', 'Xbox', 'Spotify'];

const faqs = [
  { q: 'Do you ever hold my money?', a: 'No. Your token is swapped and paid straight to the gift card provider in one transaction you sign yourself. gifted never has custody of your funds.' },
  { q: 'Who supplies the gift cards?', a: 'Cards are fulfilled through Bitrefill, one of the longest-running shops for buying gift cards with crypto.' },
  { q: 'What does it cost?', a: 'You pay the card price plus swap and network fees, all shown before you sign. gifted adds no fee of its own.' },
  { q: 'Which tokens can I use?', a: 'Any Solana token with a swap route on Jupiter. If a token can’t be routed at that moment, the app tells you before you sign.' },
  { q: 'How private is private checkout?', a: 'The shop is paid from the NEAR Intents network, so there’s no on-chain link between your wallet and the gift card purchase. What stays visible: your deposit into the network is public on your chain, the amount and timing of a payment can sometimes be matched by a determined observer, and the card is tied to whatever account you redeem it on. Private, not invisible.' },
  { q: 'Which countries?', a: 'It depends on the brand. Each card shows the country it works in, so check before you buy.' },
  { q: 'Do I need $GIFTED to use it?', a: 'No. The shop is free for everyone. $GIFTED is the meme coin behind it.' },
];

function ReceiptCard() {
  return (
    <div className="card receipt" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 20px 60px rgba(0,0,0,.45)' }} aria-hidden="true">
      <span className="label" style={{ color: 'var(--mint)' }}>Example</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span className="muted">You pay</span><span>Any token</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span className="muted">You get</span><strong>$50 gift card</strong></div>
      <div style={{ height: 1, background: 'var(--line)' }} />
      <div style={{ font: '600 14px ui-monospace, monospace', color: 'var(--gold)', letterSpacing: '.06em' }}>XXXX-XXXX-XXXX</div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="wrap" style={{ padding: '72px 20px 48px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 40 }}>
        <div style={{ flex: '999 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span className="eyebrow">Any token in. Gift card out. Privately if you want.</span>
          <h1 style={{ margin: 0, font: '800 clamp(46px, 7.4vw, 84px)/1 var(--display)', letterSpacing: '-0.04em' }}>
            Your bags,<br /><span style={{ color: 'var(--ribbon)' }}>gift wrapped.</span>
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 19, lineHeight: 1.6, maxWidth: 540 }}>
            Turn any token into a gift card for thousands of brands. Pay in one signature, or check out privately so the purchase isn’t tied to your wallet.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/spend" className="btn btn-primary">Open app</Link>
            <a href="#token" className="btn btn-ghost">Buy $GIFTED</a>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14 }} className="muted">
            <span>● Private checkout</span><span>● Non-custodial</span><span>● No sign-up</span>
          </div>
        </div>
        <div className="glow hero-art" style={{ flex: '1 1 320px', paddingBottom: 40 }}>
          <div className="float" style={{ marginRight: 60 }}><Mascot size={340} /></div>
          <ReceiptCard />
        </div>
      </section>

      {/* Brand strip */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div className="wrap" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="label">Spend on brands like</span>
          {brands.map((b) => (
            <span key={b} style={{ font: '600 16px var(--display)', color: 'var(--text)', opacity: 0.85 }}>{b}</span>
          ))}
          <span className="muted" style={{ fontSize: 13 }}>Availability varies by country</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="wrap section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          <span className="eyebrow">How it works</span>
          <h2 className="h2">Three taps from bag to card.</h2>
        </div>
        <div className="grid-3">
          {steps.map((s) => (
            <div key={s.n} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ font: '700 15px var(--display)', color: 'var(--ribbon)' }}>{s.n}</span>
              <h3 style={{ margin: 0, font: '700 22px var(--display)', letterSpacing: '-0.02em' }}>{s.t}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          <span className="eyebrow">Why gifted</span>
          <h2 className="h2">Most shops take a few coins.<br />We take the whole bag.</h2>
        </div>
        <div className="grid-2">
          {features.map((f) => (
            <div key={f.t} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ margin: 0, font: '700 20px var(--display)' }}>{f.t}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Token */}
      <section id="token" className="wrap section" style={{ paddingTop: 0 }}>
        <div className="card glow" style={{ padding: 32, display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center', overflow: 'hidden' }}>
          <Mascot size={150} variant="icon" title="The $GIFTED token icon" />
          <div style={{ flex: '999 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="eyebrow">The token</span>
            <h2 className="h2">$GIFTED</h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6, maxWidth: 620 }}>
              The meme coin behind the shop, launching on pump.fun on Solana. It has no promised value or returns, and the shop works whether you hold it or not.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 16, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
              <span className="label">Contract address</span>
              <CopyCA ca={site.ca} />
            </div>
            {(site.links.pumpfun || site.links.dexscreener) && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {site.links.pumpfun && <a className="btn btn-primary" href={site.links.pumpfun} target="_blank" rel="noopener noreferrer">Buy on pump.fun</a>}
                {site.links.dexscreener && <a className="btn btn-ghost" href={site.links.dexscreener} target="_blank" rel="noopener noreferrer">Chart</a>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="wrap section" style={{ paddingTop: 0, maxWidth: 860 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <span className="eyebrow">Questions</span>
          <h2 className="h2">Good to know</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((f) => (
            <details key={f.q} className="card" style={{ padding: '18px 20px' }}>
              <summary style={{ cursor: 'pointer', font: '600 17px var(--display)' }}>{f.q}</summary>
              <p className="muted" style={{ margin: '10px 0 0', lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="card" style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', background: 'linear-gradient(180deg, var(--surface-2), var(--surface))' }}>
          <Mascot size={150} title="" />
          <h2 className="h2">Got a bag doing nothing?</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 480, lineHeight: 1.6 }}>Turn it into something you’ll actually use.</p>
          <Link href="/spend" className="btn btn-primary">Open app</Link>
        </div>
      </section>
    </>
  );
}
