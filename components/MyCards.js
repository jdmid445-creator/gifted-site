'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadCards, saveCards, fetchCardStatus } from '@/lib/cards';

// An order that was never paid is dropped once its payment window has passed.
const UNPAID_GRACE_MS = 45 * 60 * 1000;

const LABEL = {
  processing: 'Paid. Your card is on its way, usually within a minute.',
  unpaid: 'Waiting for your payment.',
};

export default function MyCards() {
  const [cards, setCards] = useState(null);
  const [status, setStatus] = useState({}); // id -> { status, redemption } | { error }
  const [shown, setShown] = useState({}); // id -> true once the person taps Show code

  useEffect(() => {
    const list = loadCards();
    if (!list.length) { setCards([]); return; }
    let alive = true;
    (async () => {
      const results = await Promise.all(list.map((c) => fetchCardStatus(c).then((d) => [c.id, d]).catch((e) => [c.id, { error: e.message }])));
      if (!alive) return;
      const map = Object.fromEntries(results);
      const now = Date.now();
      // Forget orders that failed, or were never paid and whose window has closed.
      const keep = list.filter((c) => {
        const s = map[c.id]?.status;
        if (s === 'failed') return false;
        if (s === 'unpaid' && now - (c.at || 0) > UNPAID_GRACE_MS) return false;
        return true;
      });
      if (keep.length !== list.length) saveCards(keep);
      // Only paid orders are shown: an address you never sent to isn't a card.
      setCards(keep.filter((c) => ['complete', 'processing'].includes(map[c.id]?.status)));
      setStatus(map);
    })();
    return () => { alive = false; };
  }, []);

  async function refresh(card) {
    setStatus((s) => ({ ...s, [card.id]: { ...(s[card.id] || {}), loading: true } }));
    try {
      const data = await fetchCardStatus(card);
      setStatus((s) => ({ ...s, [card.id]: data }));
      if (data.redemption) setShown((v) => ({ ...v, [card.id]: true }));
    } catch (e) {
      setStatus((s) => ({ ...s, [card.id]: { error: e.message } }));
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
        const s = status[c.id] || {};
        const ready = s.status === 'complete' && s.redemption;
        const open = Boolean(ready && shown[c.id]);
        const code = open ? s.redemption?.code : null;
        return (
          <div key={c.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '500 18px var(--display)' }}>{c.name}</span>
                <span className="muted" style={{ fontSize: 14 }}>{c.value} {c.currency} · {new Date(c.at).toLocaleDateString()}</span>
              </div>
              {ready ? (
                <button type="button" className="btn btn-ghost" onClick={() => setShown((v) => ({ ...v, [c.id]: !v[c.id] }))}>{open ? 'Hide code' : 'Show code'}</button>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={() => refresh(c)} disabled={s.loading || !status[c.id]}>{s.loading || !status[c.id] ? 'Checking…' : 'Check again'}</button>
              )}
            </div>
            {code && <div className="code-box">{code}</div>}
            {open && s.redemption?.pin && <div className="code-box">PIN: {s.redemption.pin}</div>}
            {open && s.redemption?.link && <a href={s.redemption.link} target="_blank" rel="noopener noreferrer">Open your card ↗</a>}
            {open && s.redemption?.instructions && <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{s.redemption.instructions}</p>}
            {!ready && s.status && LABEL[s.status] && <p className="muted" style={{ margin: 0 }}>{LABEL[s.status]}</p>}
            {s.error && <div className="notice notice-warn">{s.error}</div>}
          </div>
        );
      })}
    </div>
  );
}
