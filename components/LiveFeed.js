'use client';

// Real orders only: every row is a gift card Bitrefill actually delivered.
import { useEffect, useState } from 'react';
import CardThumb from './CardThumb';

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
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 16px var(--display)' }}>
          <span className="live-dot" aria-hidden="true" /> Latest deliveries
        </span>
        <span className="label">Refreshes every 15s</span>
      </div>
      {orders === null && <span className="muted" style={{ fontSize: 14 }}>Loading…</span>}
      {orders && rows.length === 0 && (
        <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>No orders yet. The first one shows up here the moment it’s delivered.</span>
      )}
      {rows.map((o, i) => (
        <div key={`${o.at}-${o.name}`} className="feed-row" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 12, paddingTop: i ? 12 : 0, borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <CardThumb name={o.name || ''} width={40} />
          <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.name}{o.value ? <span className="num muted" style={{ fontSize: 13 }}> · {o.value} {o.currency}</span> : null}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              {o.mode === 'private' ? 'Private checkout' : `Paid with ${o.symbol || 'a Solana token'}`} · {ago(o.at, o.mode === 'private')}
            </span>
          </span>
          {o.tx && (
            <a href={`https://solscan.io/tx/${o.tx}`} target="_blank" rel="noopener noreferrer" className="num" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
              {o.tx.slice(0, 4)}…{o.tx.slice(-4)} ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
