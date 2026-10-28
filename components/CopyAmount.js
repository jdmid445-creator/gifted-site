'use client';

// The amount to send, shown as a button: tap it to copy just the number.
import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

export default function CopyAmount({ amount, symbol, size = 20 }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="copy-amount" title="Copy amount" aria-label={`Copy amount ${amount} ${symbol}`}
      onClick={() => { navigator.clipboard?.writeText(String(amount)); setOk(true); setTimeout(() => setOk(false), 1400); }}>
      <span style={{ font: `600 ${size}px var(--display)`, fontVariantNumeric: 'tabular-nums' }}>{amount} {symbol}</span>
      <span className="copy-amount-tag">{ok ? <><IconCheck width={14} height={14} /> Copied</> : <IconCopy width={14} height={14} />}</span>
    </button>
  );
}
