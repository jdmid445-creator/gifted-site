'use client';

// Gift codes stay hidden until you tap, so nobody reads them over your shoulder.
import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';

export default function RevealCode({ code }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button type="button" className="code-box code-reveal" data-shown={shown} onClick={() => setShown(true)} aria-label={shown ? 'Gift card code' : 'Reveal gift card code'}>
        <span className="code-text" aria-hidden={!shown}>{code}</span>
        {!shown && <span className="code-cover">Tap to reveal your code</span>}
      </button>
      {shown && (
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); }}>
          {copied ? <IconCheck /> : <IconCopy />} {copied ? 'Copied' : 'Copy code'}
        </button>
      )}
    </div>
  );
}
