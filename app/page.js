import Link from 'next/link';
import Mascot from '@/components/Mascot';
import Shop from '@/components/Shop';
import LiveFeed from '@/components/LiveFeed';
import CopyCA from '@/components/CopyCA';
import HeroStage from '@/components/HeroStage';
import { IconBolt, IconEyeOff, IconArrow, IconCheck } from '@/components/Icons';
import { site } from '@/lib/site';

const compare = [
  ['Who pays the shop', 'NEAR Intents, so the purchase isn’t tied to your wallet', 'Your wallet, in one signed transaction'],
  ['You connect', 'Nothing. You send to a one-time address', 'Your Solana wallet'],
  ['Pay from', 'Solana, Ethereum, Base, Arbitrum, BNB Chain, Bitcoin, Litecoin, Dogecoin', 'Any token in your Solana wallet'],
  ['On-chain trail', 'Your deposit is public on its own chain. The card purchase isn’t linked to it', 'Public, and linked in the live feed'],
  ['Typical time', 'A few minutes', 'Under a minute'],
];

const path = [
  ['Pick a card', 'Hundreds of brands across 20 countries.'],
  ['Pick any coin', 'From Solana, Ethereum, Base, Bitcoin and 4 more chains.'],
  ['Send to a one-time address', 'No wallet connection. A fresh address for every order.'],
  ['NEAR Intents pays the shop', 'The payment reaches the shop from the network, not from you.'],
  ['Get your code', 'Shown on screen and saved in this browser.'],
];

const sees = ['A paid order for a gift card', 'USDC from NEAR Intents', 'A backup refund address you choose'];
const neverSees = ['The wallet you paid from', 'Your balances or what else you hold', 'Which coin or chain you paid from'];

const faqs = [
  ['What does Private actually hide?', 'The shop gets paid by NEAR Intents instead of your wallet, so the purchase isn’t linked to you. Your own deposit is still visible on its blockchain, and the card is tied to whatever account you redeem it on.'],
  ['What does it cost?', 'GiftedSwaps charges no fee. You pay the card price from Bitrefill, plus the swap and a small network fee. You see the exact amount before you sign anything.'],
  ['Do I need an account or ID?', 'No. Standard checkout uses your Solana wallet. Private checkout works from any wallet on 8 chains, without connecting.'],
  ['What is Max privacy?', 'The most private way to pay. Your coins go through Monero via Houdini Swap and arrive as SOL in a one-time wallet made in your browser, which then buys the card. Nothing on-chain connects what you sent to the card. It takes 15–45 minutes and costs a little more.'],
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
              <span className="line"><span className="line-inner">Spend crypto on</span></span>
              <span className="line"><span className="line-inner">real things. <span style={{ color: 'var(--ribbon)' }}>Privately.</span></span></span>
            </h1>
            <p className="muted rise" style={{ '--d': '380ms', margin: 0, fontSize: 19, lineHeight: 1.5, maxWidth: 540 }}>
              Gift cards for hundreds of brands, paid with any token from 8 chains. The shop gets paid, but never sees your wallet.
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

      {/* What the shop sees */}
      <section id="privacy" className="wrap section">
        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, maxWidth: 680 }}>
          <h2 className="h2">The shop gets paid. <span className="dim">It never sees your wallet.</span></h2>
          <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            Normally a crypto purchase draws a straight line from your wallet to the store. With private checkout, NEAR Intents pays the shop for you, so that line doesn’t exist.
          </p>
        </div>
        <div className="grid-2" data-reveal>
          <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ font: '500 17px var(--display)' }}>What the shop sees</span>
            {sees.map((t) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}><IconCheck width={18} height={18} style={{ color: 'var(--mint)' }} />{t}</span>
            ))}
          </div>
          <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'rgba(240,81,122,.35)', background: 'linear-gradient(180deg, rgba(240,81,122,.07), rgba(240,81,122,0) 60%), var(--surface)' }}>
            <span style={{ font: '500 17px var(--display)', color: 'var(--ribbon)' }}>What it never sees</span>
            {neverSees.map((t) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}><IconEyeOff width={18} height={18} style={{ color: 'var(--ribbon)' }} />{t}</span>
            ))}
          </div>
        </div>
        <p className="muted" style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6 }}>
          Your own deposit is still public on its chain, like any transfer. <Link href="/docs#private">How private checkout works</Link>
        </p>
      </section>

      {/* Live orders */}
      <section id="live" className="wrap section" style={{ scrollMarginTop: 70 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>
          <div data-reveal style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 470 }}>
            <h2 className="h2">Real crypto, <span className="dim">real cards.</span></h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 16 }}>
              Each order shows up here once Bitrefill delivers it. Private orders show the card and a rough time, nothing else. Standard checkout orders link to their transaction.
            </p>
          </div>
          <div data-reveal style={{ '--d': '120ms', flex: '999 1 440px', minWidth: 0 }}><LiveFeed limit={6} /></div>
        </div>
      </section>

      {/* Standard vs Private */}
      <section className="wrap section">
        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, maxWidth: 640 }}>
          <h2 className="h2">Private by default. <span className="dim">Standard if you want speed.</span></h2>
        </div>
        <div className="card table-scroll" data-reveal style={{ padding: '22px 8px 6px' }}>
          <table className="compare">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Detail</span></th>
                <th scope="col"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ribbon)' }}><IconEyeOff width={17} height={17} /> Private</span></th>
                <th scope="col"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconBolt width={17} height={17} /> Standard</span></th>
              </tr>
            </thead>
            <tbody>
              {compare.map(([k, a, b], i) => (
                <tr key={k} style={{ '--i': i }}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order path */}
      <section className="wrap section">
        <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <h2 className="h2">Private, <span className="dim">start to finish.</span></h2>
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
