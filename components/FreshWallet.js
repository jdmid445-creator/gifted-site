'use client';

// Make a fresh wallet in the browser, or open a wallet app to add a new account.
// Nothing here talks to a server: keys are generated and shown on this device only.
import { useEffect, useRef, useState } from 'react';
import { newSolanaWallet, newEvmWallet, newBitcoinWallet, newLitecoinWallet, newDogecoinWallet, newTronWallet } from '@/lib/freshwallet';
import { IconCopy, IconCheck, IconEyeOff, IconShield } from './Icons';

const EVM_HOW = 'In MetaMask, Rabby or Coinbase Wallet: Add account → Import account, then paste the key. The same address works on every EVM chain.';
const KINDS = {
  sol: { domain: 'solana.com', label: 'Solana', make: newSolanaWallet, how: 'In Phantom, Solflare or Backpack: Add account → Import private key, then paste the key.' },
  eth: { domain: 'ethereum.org', label: 'Ethereum', make: newEvmWallet, how: EVM_HOW },
  base: { domain: 'base.org', label: 'Base', make: newEvmWallet, how: EVM_HOW },
  arb: { domain: 'arbitrum.io', label: 'Arbitrum', make: newEvmWallet, how: EVM_HOW },
  bnb: { domain: 'bnbchain.org', label: 'BNB Chain', make: newEvmWallet, how: EVM_HOW },
  polygon: { domain: 'polygon.technology', label: 'Polygon', make: newEvmWallet, how: EVM_HOW },
  avax: { domain: 'avax.network', label: 'Avalanche', make: newEvmWallet, how: EVM_HOW },
  btc: { domain: 'bitcoin.org', label: 'Bitcoin', make: newBitcoinWallet, how: 'In Electrum: New wallet → Import Bitcoin addresses or private keys, then paste p2wpkh: followed by the key (no space). Sparrow and Exodus can import it too.' },
  ltc: { domain: 'litecoin.org', label: 'Litecoin', make: newLitecoinWallet, how: 'In Electrum-LTC: New wallet → Import addresses or private keys, then paste p2wpkh: followed by the key (no space). Exodus can import it too.' },
  doge: { domain: 'dogecoin.com', label: 'Dogecoin', make: newDogecoinWallet, how: 'Import the private key in a wallet that supports it, like Exodus or Dogecoin Core.' },
  tron: { domain: 'tron.network', label: 'Tron', make: newTronWallet, how: 'In TronLink: Add wallet → Import → Private key, then paste the key.' },
};

const APPS = [
  ['Phantom', 'https://phantom.com/download', 'Solana, Ethereum, Base, Bitcoin'],
  ['Solflare', 'https://www.solflare.com/download/', 'Solana'],
  ['Backpack', 'https://backpack.app/download', 'Solana, Ethereum'],
  ['MetaMask', 'https://metamask.io/download/', 'Ethereum and every EVM chain'],
  ['Rabby', 'https://rabby.io/', 'Ethereum and every EVM chain'],
  ['Coinbase Wallet', 'https://www.coinbase.com/wallet/downloads', 'Ethereum, Base, Solana, Bitcoin'],
  ['OKX Wallet', 'https://www.okx.com/web3', 'Most chains'],
  ['Rainbow', 'https://rainbow.me/download', 'Ethereum, Base, Arbitrum'],
  ['Zerion', 'https://zerion.io/download', 'Ethereum and EVM chains, Solana'],
  ['Trust Wallet', 'https://trustwallet.com/download', 'Bitcoin, Litecoin, Dogecoin and 100+ more'],
  ['Exodus', 'https://www.exodus.com/download/', 'Bitcoin, Litecoin, Dogecoin and more'],
  ['Electrum', 'https://electrum.org/#download', 'Bitcoin'],
  ['Sparrow', 'https://sparrowwallet.com/download/', 'Bitcoin'],
  ['TronLink', 'https://www.tronlink.org/', 'Tron'],
  ['Ledger', 'https://www.ledger.com/ledger-live', 'Hardware wallet, most chains'],
  ['Tangem', 'https://tangem.com/', 'Hardware card, most chains'],
];

const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

function Logo({ domain, size = 18, round = true }) {
  const [ok, setOk] = useState(true);
  if (!ok || !domain) return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: round ? '50%' : 6, background: 'var(--surface-3)', flex: 'none' }} />;
  return <img src={favicon(domain)} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} style={{ width: size, height: size, borderRadius: round ? '50%' : 6, flex: 'none', background: '#fff' }} />;
}

// Characters roll through random glyphs, then settle left to right.
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
function Scramble({ text }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOut(text); return undefined; }
    const start = performance.now();
    const dur = 650;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const settled = Math.floor(p * text.length);
      let s = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text]);
  return <span>{out}</span>;
}

function CopyBtn({ value, label }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1400); }}>
      {ok ? <IconCheck /> : <IconCopy />} {ok ? 'Copied' : label}
    </button>
  );
}

export default function FreshWallet() {
  const [kind, setKind] = useState('sol');
  const [wallet, setWallet] = useState(null);
  const [n, setN] = useState(0);
  const [shown, setShown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const k = KINDS[kind];

  function make() {
    setWallet(k.make());
    setN((x) => x + 1);
    setShown(false); setSaved(false); setSent(false);
  }

  function useAsBackup() {
    try { localStorage.setItem('gifted.freshSol', JSON.stringify({ address: wallet.address, at: Date.now() })); } catch {}
    setSent(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      <div className="card fw-card rise" style={{ '--d': '220ms' }}>
        <div className="fw-row">
          <span className="step-num">01</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, flex: 1 }}>
            <span className="fw-h">Pick a chain</span>
            <div role="group" aria-label="Which chain" className="fw-chips">
              {Object.entries(KINDS).map(([key, v]) => (
                <button key={key} type="button" className="fw-chip" aria-pressed={kind === key} onClick={() => { setKind(key); setWallet(null); }}>
                  <Logo domain={v.domain} size={16} />{v.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={make}>
              {wallet ? `Make another ${k.label} wallet` : `Make a ${k.label} wallet`}
            </button>
          </div>
        </div>

        {wallet && (
          <div key={n} className="fw-result">
            <div className="fw-row">
              <span className="step-num">02</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, flex: 1 }}>
                <span className="fw-h">Your new address</span>
                <div className="key-line"><Logo domain={k.domain} size={20} /><code><Scramble text={wallet.address} /></code></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><CopyBtn value={wallet.address} label="Copy address" /></div>
              </div>
            </div>

            <div className="fw-row">
              <span className="step-num">03</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, flex: 1 }}>
                <span className="fw-h">Save the private key</span>
                <button type="button" className="key-line key-secret" data-shown={shown} onClick={() => setShown(true)} aria-label={shown ? 'Private key' : 'Show private key'}>
                  <code className="code-text" aria-hidden={!shown}>{wallet.secret}</code>
                  {!shown && <span className="code-cover"><IconEyeOff width={16} height={16} /> Tap to show</span>}
                </button>
                {shown && <div style={{ display: 'flex', gap: 8 }}><CopyBtn value={wallet.secret} label="Copy private key" /></div>}
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{k.how}</p>
                <p className="fw-note"><IconShield width={16} height={16} /> Made on this device. GiftedSwaps never sees or stores it, so if you close the tab without saving it, it’s gone.</p>
                <label className="fw-check">
                  <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                  <span>I saved it in a wallet app</span>
                </label>
                {kind === 'sol' && (
                  <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={useAsBackup} disabled={!saved || sent}>
                    {sent ? <><IconCheck /> Added to your checkout</> : 'Use as my backup address'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, font: '500 28px/1.15 var(--display)', letterSpacing: '-0.025em' }}>Or use a wallet app. <span className="dim">Add a second account.</span></h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>A new account in your wallet gets its own address, with no link to your main one.</p>
        </div>
        <div className="fw-apps" data-reveal>
          {APPS.map(([name, href, chains], i) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="fw-app" style={{ '--i': i }}>
              <Logo domain={hostOf(href)} size={28} round={false} />
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chains}</span>
              </span>
              <span className="fw-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
