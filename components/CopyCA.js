'use client';

import { useState } from 'react';

export default function CopyCA({ ca }) {
  const [copied, setCopied] = useState(false);
  if (!ca) {
    return <span style={{ font: '600 15px ui-monospace, monospace' }}>Launching soon</span>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ font: '600 15px ui-monospace, monospace', wordBreak: 'break-all', flex: '1 1 260px' }}>{ca}</span>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ minHeight: 44 }}
        onClick={() => {
          navigator.clipboard?.writeText(ca);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
