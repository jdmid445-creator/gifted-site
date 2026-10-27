'use client';

// Real orders only: every row is a gift card Bitrefill actually delivered.
import { useEffect, useState } from 'react';

function ago(ts, isPrivate) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (isPrivate && s < 3600) return 'within the hour';
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LiveFeed({ limit = 6, compact = false }) {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetch('/api/feed').then((r) => r.json()).then((d) => { if (alive) setOrders(d.orders || []); }).catch(() => { if (alive) setOrders([]); });
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const rows = (orders || []).slice(0, limit);

  return (
    <div className="card" style={{ padding: compact ? 16 : 22, display: 'flex', flexDirection: 'column', gap: 12 }} aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 16px var(--display)' }}>
          <span className="live-dot" aria-hidden="true" /> Live orders
        </span>
        <span className="muted" style={{ fontSize: 12 }}>Real purchases, updated live</span>
      </div>
      {orders === null && <span className="muted" style={{ fontSize: 14 }}>Loading…</span>}
      {orders && rows.length === 0 && (
        <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>No orders yet. The first one shows up here the moment it’s delivered.</span>
      )}
      {rows.map((o, i) => (
        <div key={`${o.at}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: i ? 12 : 0, borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px var(--display)', color: 'var(--gold)' }} aria-hidden="true">
            {(o.name || '?').slice(0, 1)}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.value ? `${o.value} ${o.currency} ` : ''}{o.name}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              {o.mode === 'private' ? 'Private checkout' : `Paid with ${o.symbol || 'a Solana token'}`} · {ago(o.at, o.mode === 'private')}
            </span>
          </span>
          {o.tx && (
            <a href={`https://solscan.io/tx/${o.tx}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              Verify
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
