import Link from 'next/link';
import Mascot from '@/components/Mascot';
import Shop from '@/components/Shop';
import LiveFeed from '@/components/LiveFeed';
import CopyCA from '@/components/CopyCA';
import HeroStage from '@/components/HeroStage';
import { IconBolt, IconEyeOff, IconArrow } from '@/components/Icons';
import { site } from '@/lib/site';

const compare = [
  ['You connect', 'Your Solana wallet', 'Nothing. You send to a one-time address'],
  ['Pay from', 'Any token in your Solana wallet', 'Solana, Ethereum, Base, Arbitrum, BNB Chain, Bitcoin, Litecoin, Dogecoin'],
  ['Who pays the shop', 'Your wallet, in one signed transaction', 'NEAR Intents, so the purchase isn’t tied to your wallet'],
  ['On-chain trail', 'Public, and linked in the live feed', 'Your deposit is public on its own chain. The card purchase isn’t linked to it'],
  ['Typical time', 'Under a minute', 'A few minutes'],
];

const path = [
  ['Your token', 'SOL, BONK, WIF, or anything else in your wallet.'],
  ['Jupiter', 'Swaps it into the exact USDC the card costs.'],
  ['Bitrefill invoice', 'USDC lands on the invoice address. Never with us.'],
  ['Delivery', 'Bitrefill issues the card, usually in under a minute.'],
  ['Your code', 'Shown on screen and saved in this browser.'],
];

const faqs = [
  ['What does it cost?', 'gifted charges no fee. You pay the card price from Bitrefill, plus the swap and a small network fee. You see the exact amount before you sign anything.'],
  ['Do I need an account or ID?', 'No. Standard checkout uses your Solana wallet. Private checkout works from any wallet on 8 chains, without connecting.'],
  ['What does Private actually hide?', 'The shop gets paid by NEAR Intents instead of your wallet, so the purchase isn’t linked to you. Your own deposit is still visible on its blockchain.'],
  ['Where do I get my code?', 'On screen as soon as it’s delivered, usually in under a minute. It’s also saved in this browser under My cards. Treat it like cash.'],
  ['What if something goes wrong?', 'If the payment doesn’t go through, your money goes back to your wallet. If a card can’t be delivered, Bitrefill refunds you in USDC on Solana.'],
  ['Can I use it outside the US?', 'Yes. Pick your country next to the search box. Gift cards are country-specific, so buy one for where you’ll use it.'],
  ['Do I need $GIFTED to use the shop?', 'No. The shop works with any token. $GIFTED is the meme coin behind it.'],
];

export default function Home() {
  return (
    <>
      {/* Hero + shop */}
      <section className="wrap hero" style={{ paddingTop: 72, paddingBottom: 0 }}>
        <div className="hero-bg" aria-hidden="true" />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>
          <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 className="hero-title" style={{ margin: 0, font: '500 clamp(42px, 6vw, 78px)/1.02 var(--display)', letterSpacing: '-0.032em' }}>
              <span className="line"><span className="line-inner">Spend your crypto</span></span>
              <span className="line"><span className="line-inner">on <span style={{ color: 'var(--ribbon)' }}>real things.</span></span></span>
            </h1>
            <p className="muted rise" style={{ '--d': '380ms', margin: 0, fontSize: 19, lineHeight: 1.5, maxWidth: 540 }}>
              Pick a gift card, pick any token, and pay. Turn on Private and the purchase isn’t tied to your wallet.
            </p>
          </div>
          <div className="hero-art rise" style={{ '--d': '200ms' }}>
            <HeroStage />
          </div>
        </div>
        <div id="shop" className="rise" style={{ '--d': '560ms', scrollMarginTop: 90 }}>
          <Shop />
        </div>
      </section>

      {/* Live orders */}
      <section id="live" className="wrap section" style={{ scrollMarginTop: 70 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
          <div data-reveal style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 470 }}>
            <h2 className="h2">Real crypto, <span className="dim">real cards.</span></h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 16 }}>
              Each order shows up here once Bitrefill delivers it. Standard orders link to their transaction on Solscan. Private orders show the card only.
            </p>
          </div>
          <div data-reveal style={{ '--d': '120ms', flex: '999 1 440px', minWidth: 0 }}><LiveFeed limit={6} /></div>
        </div>
      </section>

      {/* Standard vs Private */}
      <section className="wrap section">
        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, maxWidth: 640 }}>
          <h2 className="h2">Fast, or <span className="dim">off the record.</span></h2>
        </div>
        <div className="card table-scroll" data-reveal style={{ padding: '22px 8px 6px' }}>
          <table className="compare">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Detail</span></th>
                <th scope="col"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconBolt width={17} height={17} /> Standard</span></th>
                <th scope="col"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ribbon)' }}><IconEyeOff width={17} height={17} /> Private</span></th>
              </tr>
            </thead>
            <tbody>
              {compare.map(([k, a, b], i) => (
                <tr key={k} style={{ '--i': i }}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ margin: '14px 0 0', fontSize: 14 }}>
          <Link href="/docs#private">How private checkout works</Link>
        </p>
      </section>

      {/* Order path */}
      <section className="wrap section">
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <h2 className="h2">Wallet to code, <span className="dim">in one pass.</span></h2>
          </div>
          <Link href="/docs" className="btn btn-ghost">Read the docs <IconArrow width={18} height={18} /></Link>
        </div>
        <div className="path" data-reveal>
          {path.map(([name, text], i) => (
            <div key={name} style={{ '--i': i }}>
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ font: '500 17px var(--display)', letterSpacing: '-0.01em' }}>{name}</span>
                <span className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap section" id="faq">
        <h2 className="h2" data-reveal style={{ marginBottom: 28 }}>Questions, <span className="dim">answered.</span></h2>
        <div className="faq" data-reveal>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Token */}
      <section id="token" className="wrap section" style={{ paddingBottom: 56 }}>
        <div className="card" data-reveal style={{ padding: 24, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 300px' }}>
            <Mascot size={56} variant="icon" title="" />
            <div>
              <div style={{ font: '500 20px var(--display)', letterSpacing: '-0.02em' }}>$GIFTED</div>
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
