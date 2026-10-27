'use client';

// Make a fresh wallet in the browser, or open a wallet app to add a new account.
// Nothing here talks to a server: keys are generated and shown on this device only.
import { useState } from 'react';
import { newSolanaWallet, newEvmWallet } from '@/lib/freshwallet';
import { IconCopy, IconCheck } from './Icons';

const KINDS = {
  sol: { label: 'Solana', make: newSolanaWallet, importHow: 'In Phantom, Solflare or Backpack: Add account → Import private key, then paste the key.' },
  evm: { label: 'Ethereum & EVM', make: newEvmWallet, importHow: 'In MetaMask or Rabby: Add account → Import account, then paste the key. The same address works on every EVM chain.' },
};

const APPS = [
  ['Phantom', 'https://phantom.com/download', 'Solana, Ethereum, Base, Bitcoin'],
  ['Solflare', 'https://www.solflare.com/download/', 'Solana'],
  ['Backpack', 'https://backpack.app/download', 'Solana, Ethereum'],
  ['MetaMask', 'https://metamask.io/download/', 'Ethereum, Base, Arbitrum, BNB'],
  ['Rabby', 'https://rabby.io/', 'Ethereum, Base, Arbitrum, BNB'],
  ['Exodus', 'https://www.exodus.com/download/', 'Bitcoin, Litecoin, Dogecoin and more'],
  ['Trust Wallet', 'https://trustwallet.com/download', 'Bitcoin, Litecoin, Dogecoin and more'],
];

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
  const [shown, setShown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  function make() {
    setWallet(KINDS[kind].make());
    setShown(false); setSaved(false); setSent(false);
  }

  function useAsBackup() {
    try { localStorage.setItem('gifted.freshSol', JSON.stringify({ address: wallet.address, at: Date.now() })); } catch {}
    setSent(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ font: '500 19px var(--display)' }}>Make one right here</span>
        <div className="mode-switch" role="group" aria-label="Wallet type" style={{ maxWidth: 460 }}>
          {Object.entries(KINDS).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setWallet(null); }}>{v.label}</button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={make}>{wallet ? 'Make another' : `Make a ${KINDS[kind].label.split(',')[0]} wallet`}</button>

        {wallet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label">Address (safe to share)</span>
              <code className="code-box" style={{ fontSize: 15 }}>{wallet.address}</code>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <CopyBtn value={wallet.address} label="Copy address" />
                {kind === 'sol' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={useAsBackup} disabled={!saved}>
                    {sent ? 'Added to your checkout tab' : 'Use as my backup address'}
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label">Private key (never share this)</span>
              <button type="button" className="code-box code-reveal" data-shown={shown} onClick={() => setShown(true)} style={{ fontSize: 14 }}>
                <span className="code-text" aria-hidden={!shown}>{wallet.secret}</span>
                {!shown && <span className="code-cover">Tap to show your private key</span>}
              </button>
              {shown && <div style={{ display: 'flex', gap: 8 }}><CopyBtn value={wallet.secret} label="Copy private key" /></div>}
              <span className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{KINDS[kind].importHow}</span>
            </div>
            <div className="notice notice-warn">
              This key is the wallet. It only exists on this screen: gifted never sees or stores it. Save it in a wallet app before you close this tab, or any refund sent here is lost.
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
              <span>I saved the private key in a wallet app.</span>
            </label>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ font: '500 19px var(--display)' }}>Or add a new account in a wallet app</span>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>Most wallets let you add a second account in a couple of taps. It gets its own address that isn’t linked to your main one.</p>
        <div className="grid-2">
          {APPS.map(([name, href, chains]) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="pick" style={{ textDecoration: 'none', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="muted" style={{ fontSize: 12.5 }}>{chains}</span>
              </span>
              <span className="muted" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
