'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

// The wallet button only renders in the browser (it reads installed wallets).
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false, loading: () => <span className="hdr-link" style={{ display: 'inline-block', width: 64 }} /> }
);

export function WalletButton() {
  return <WalletMultiButton>Connect</WalletMultiButton>;
}

// Small, always-visible CA chip: easy to find, never the hero.
export function CaPill({ ca, compact = false }) {
  const [copied, setCopied] = useState(false);
  const short = ca ? `${ca.slice(0, 4)}…${ca.slice(-4)}` : 'soon';
  return (
    <button
      type="button"
      className={compact ? "hdr-sub-link hdr-ca hdr-ca-sm" : "hide-sm hdr-link hdr-ca"}
      disabled={!ca}
      onClick={() => { navigator.clipboard?.writeText(ca); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      aria-label={ca ? `Copy contract address ${ca}` : 'Contract address coming soon'}
    >
      <span className="muted">CA:</span> {short}
      {ca ? (copied ? <IconCheck width={15} height={15} /> : <IconCopy width={15} height={15} />) : null}
    </button>
  );
}
