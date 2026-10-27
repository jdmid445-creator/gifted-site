import Link from 'next/link';
import Mascot from '@/components/Mascot';
import Shop from '@/components/Shop';
import LiveFeed from '@/components/LiveFeed';
import CopyCA from '@/components/CopyCA';
import { IconBolt, IconEyeOff, IconCheck, IconGift, IconSwap, IconShield, IconChain, IconArrow } from '@/components/Icons';
import { site } from '@/lib/site';

const modes = [
  {
    icon: IconBolt,
    name: 'Standard',
    line: 'For speed.',
    points: ['Pay with any token in your Solana wallet', 'One signature, swap and payment together', 'Every order verifiable on Solscan'],
  },
  {
    icon: IconEyeOff,
    name: 'Private',
    line: 'For privacy.',
    points: ['The shop is paid by NEAR Intents, not your wallet', 'Pay from Solana, Ethereum, Base, Bitcoin and 4 more', 'No wallet connection needed: send to a one-time address'],
  },
];

const stack = [
  { icon: IconGift, name: 'Bitrefill', role: 'Delivers the gift card. Thousands of brands across 170+ countries.' },
  { icon: IconSwap, name: 'Jupiter', role: 'Swaps your token into the exact amount the card costs.' },
  { icon: IconShield, name: 'NEAR Intents', role: 'Pays the shop for private orders on its confidential network.' },
  { icon: IconChain, name: 'Solana', role: 'Settles standard orders in seconds, for a fraction of a cent.' },
];

export default function Home() {
  return (
    <>
      {/* Hero + shop */}
      <section className="wrap" style={{ paddingTop: 44, paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 28 }}>
          <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <a href="#live" style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '6px 12px 6px 10px', borderRadius: 999, border: '1.5px solid var(--line)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              <span className="live-dot" aria-hidden="true" /> Orders deliver live. See them below
            </a>
            <h1 style={{ margin: 0, font: '600 clamp(44px, 7.6vw, 96px)/0.96 var(--display)', letterSpacing: '-0.05em' }}>
              Spend your bags<br />on <span className="serif" style={{ color: 'var(--ribbon)', letterSpacing: '-0.02em' }}>real things.</span>
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: 19, lineHeight: 1.55, maxWidth: 560 }}>
              Pick a gift card, pick any token, and pay. Turn on Private and the purchase isn’t tied to your wallet.
            </p>
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'flex-end' }} className="hide-sm">
            <Mascot size={230} title="The gifted creature peeking out of a gift box" />
          </div>
        </div>
        <div id="shop" style={{ scrollMarginTop: 90 }}>
          <Shop />
        </div>
      </section>

      {/* Live orders */}
      <section id="live" className="wrap section" style={{ scrollMarginTop: 70 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440 }}>
            <span className="eyebrow">Happening now</span>
            <h2 className="h2">Real bags.<br /><span className="serif">Real cards.</span></h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 17 }}>
              Every delivered order lands here the moment it’s done. Standard orders link to the transaction so you can check it yourself. Private orders stay private.
            </p>
          </div>
          <div style={{ flex: '999 1 440px', minWidth: 0 }}><LiveFeed limit={6} /></div>
        </div>
      </section>

      {/* Two ways to pay */}
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <span className="eyebrow">Two ways to pay</span>
          <h2 className="h2">Fast, or <span className="serif">off the record.</span></h2>
        </div>
        <div className="grid-2">
          {modes.map(({ icon: Icon, name, line, points }) => (
            <div key={name} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: name === 'Private' ? 'var(--ribbon-soft)' : 'var(--surface-2)', color: name === 'Private' ? 'var(--ribbon)' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon width={22} height={22} /></span>
                <div>
                  <div style={{ font: '600 22px var(--display)', letterSpacing: '-0.02em' }}>{name}</div>
                  <div className="muted" style={{ fontSize: 14 }}>{line}</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--mint)', marginTop: 1 }}><IconCheck width={18} height={18} /></span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="muted" style={{ margin: '16px 0 0', fontSize: 14 }}>
          Private hides the link between your wallet and the purchase. Your deposit is still public on its own chain. <Link href="/docs#private">How private checkout works</Link>
        </p>
      </section>

      {/* Under the hood */}
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">Under the hood</span>
            <h2 className="h2">Built on rails <span className="serif">you already trust.</span></h2>
          </div>
          <Link href="/docs" className="btn btn-ghost">Read the docs <IconArrow width={18} height={18} /></Link>
        </div>
        <div className="grid-4">
          {stack.map(({ icon: Icon, name, role }) => (
            <div key={name} className="panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Icon width={24} height={24} />
              <div style={{ font: '600 18px var(--display)' }}>{name}</div>
              <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{role}</p>
            </div>
          ))}
        </div>
        <p className="muted" style={{ margin: '16px 0 0', fontSize: 14 }}>gifted never holds your money. Every payment goes from your wallet straight to these networks.</p>
      </section>

      {/* Token */}
      <section id="token" className="wrap" style={{ paddingBottom: 48 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 300px' }}>
            <Mascot size={56} variant="icon" title="" />
            <div>
              <div style={{ font: '600 20px var(--display)' }}>$GIFTED</div>
              <div className="muted" style={{ fontSize: 14 }}>The meme coin behind the shop. Not required to use it.</div>
            </div>
          </div>
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Contract address</span>
            <CopyCA ca={site.ca} />
          </div>
          {site.links.pumpfun && (
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="btn btn-primary btn-sm" href={site.links.pumpfun} target="_blank" rel="noopener noreferrer">pump.fun</a>
              <a className="btn btn-ghost btn-sm" href={site.links.dexscreener} target="_blank" rel="noopener noreferrer">Chart</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
