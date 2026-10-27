'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadCards, fetchCardStatus } from '@/lib/cards';

export default function MyCards() {
  const [cards, setCards] = useState(null);
  const [open, setOpen] = useState({}); // id -> { loading, data, error }

  useEffect(() => { setCards(loadCards()); }, []);

  async function reveal(card) {
    setOpen((o) => ({ ...o, [card.id]: { loading: true } }));
    try {
      const data = await fetchCardStatus(card);
      setOpen((o) => ({ ...o, [card.id]: { data } }));
    } catch (e) {
      setOpen((o) => ({ ...o, [card.id]: { error: e.message } }));
    }
  }

  if (cards === null) return <p className="muted">Loading…</p>;

  if (cards.length === 0) {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>No cards in this browser yet.</p>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>Cards you buy are saved here on this device. If you bought one in another browser, open it there.</p>
        <Link href="/#shop" className="btn btn-primary">Get your first card</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cards.map((c) => {
        const s = open[c.id] || {};
        const code = s.data?.redemption?.code;
        return (
          <div key={c.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '500 18px var(--display)' }}>{c.name}</span>
                <span className="muted" style={{ fontSize: 14 }}>{c.value} {c.currency} · {new Date(c.at).toLocaleDateString()}</span>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => reveal(c)} disabled={s.loading}>
                {s.loading ? 'Checking…' : code ? 'Refresh' : 'Show code'}
              </button>
            </div>
            {code && <div className="code-box">{code}</div>}
            {s.data?.redemption?.instructions && <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{s.data.redemption.instructions}</p>}
            {s.data && !code && <p className="muted" style={{ margin: 0 }}>Status: {s.data.status}. Check back in a minute.</p>}
            {s.error && <div className="notice notice-warn">{s.error}</div>}
          </div>
        );
      })}
    </div>
  );
}
