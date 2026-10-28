'use client';

// Every paid order, read from Bitrefill. Wallets stay hidden: the chip is blurred filler, not an address.
import { useEffect, useState } from 'react';
import CardThumb from './CardThumb';
import { domainFor } from '@/lib/brands';

function ago(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 300) return 'just now';
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
        <div key={`${o.id}-${o.at}`} className="feed-row" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 12, paddingTop: i ? 12 : 0, borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <CardThumb name={o.name || ''} image={o.image} domain={domainFor(o.name)} width={40} />
          <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {o.name}{o.value ? <span className="muted" style={{ fontSize: 13 }}> · ${o.value}{o.currency && o.currency !== 'USD' ? ` ${o.currency}` : ''}</span> : null}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>Paid with crypto · {ago(o.at)}</span>
          </span>
          {o.wallet && <span className="feed-wallet" aria-label="Wallet hidden" title="Wallet hidden">{o.wallet}</span>}
        </div>
      ))}
    </div>
  );
}
