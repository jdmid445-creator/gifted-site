'use client';

import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

export default function CopyCA({ ca }) {
  const [copied, setCopied] = useState(false);
  if (!ca) return <span style={{ font: '500 15px var(--mono)' }} className="muted">Posted here at launch</span>;
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(ca); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', width: '100%', minHeight: 46, padding: '0 14px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}
      aria-label={`Copy contract address ${ca}`}
    >
      <span style={{ font: '500 14px var(--mono)', wordBreak: 'break-all' }}>{ca}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, flex: 'none' }}>{copied ? <IconCheck width={16} height={16} /> : <IconCopy width={16} height={16} />}{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
