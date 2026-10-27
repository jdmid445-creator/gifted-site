'use client';

// Hero stage: the gift card stack tilts toward the cursor, the creature's eyes follow it,
// and a click (or tap) makes it duck into its box and pop back up.
import { useEffect, useRef, useState } from 'react';
import GiftCardArt from './GiftCardArt';
import Mascot from './Mascot';

export default function HeroStage() {
  const stage = useRef(null);
  const [ducking, setDucking] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The entrance (pop out of the box) runs once; after that only the idle bob plays.
    const readyTimer = setTimeout(() => setReady(true), reduce ? 0 : 1700);
    if (reduce) return () => clearTimeout(readyTimer);

    let raf = 0;
    let target = { x: 0, y: 0 };
    let cur = { x: 0, y: 0 };
    let idle = 0;

    const set = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      el.style.setProperty('--tx', cur.x.toFixed(3));
      el.style.setProperty('--ty', cur.y.toFixed(3));
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) raf = requestAnimationFrame(set);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(set); };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      target = {
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))),
      };
      kick();
      clearTimeout(idle);
      idle = setTimeout(() => { target = { x: 0, y: 0 }; kick(); }, 4000);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      clearTimeout(readyTimer);
    };
  }, []);

  function poke() {
    if (ducking || !ready) return;
    setDucking(true);
    setTimeout(() => setDucking(false), 1500);
  }

  return (
    <div className="stage" ref={stage}>
      <div className="stage-cards"><GiftCardArt /></div>
      <button
        type="button"
        className={`stage-mascot${ready ? ' is-ready' : ''}${ducking ? ' is-ducking' : ''}`}
        onClick={poke}
        aria-label="Poke the GiftedSwaps creature"
      >
        <Mascot size={180} title="" />
      </button>
    </div>
  );
}
