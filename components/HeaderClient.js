'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

// The wallet button only renders in the browser (it reads installed wallets).
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false, loading: () => <span style={{ width: 128, height: 40, display: 'inline-block' }} /> }
);

export function WalletButton() {
  return <WalletMultiButton>Connect</WalletMultiButton>;
}

// Small, always-visible CA chip: easy to find, never the hero.
export function CaPill({ ca }) {
  const [copied, setCopied] = useState(false);
  const short = ca ? `${ca.slice(0, 4)}…${ca.slice(-4)}` : 'soon';
  return (
    <button
      type="button"
      className="hide-sm"
      disabled={!ca}
      onClick={() => { navigator.clipboard?.writeText(ca); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      aria-label={ca ? `Copy contract address ${ca}` : 'Contract address coming soon'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 12px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', font: '500 13px var(--mono)', cursor: ca ? 'pointer' : 'default' }}
    >
      <span className="muted">CA:</span> {short}
      {ca ? (copied ? <IconCheck width={15} height={15} /> : <IconCopy width={15} height={15} />) : null}
    </button>
  );
}
