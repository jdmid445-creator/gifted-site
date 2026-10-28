'use client';

// Max privacy: send any coin to Houdini, which routes it through Monero and delivers SOL to a
// one-time wallet made in this tab. When the SOL lands, this tab buys the card from that wallet
// (swap + pay in one transaction). Nothing links the coin you sent to the card you got.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';
import { Buffer } from 'buffer';
import bs58 from 'bs58';
import QrCode from './QrCode';
import OrderSummary from './OrderSummary';
import CopyAmount from './CopyAmount';
import RevealCode from './RevealCode';
import { relay } from './TokenIcon';
import { loadCards, saveCards, statusUrl } from '@/lib/cards';
import { IconCopy, IconCheck, IconSearch, IconShield, IconEyeOff } from './Icons';

const SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SESSION = 'gs.max.v1';

const STEPS = [
  ['WAITING', 'Waiting for your deposit'],
  ['CONFIRMING', 'Deposit seen, confirming'],
  ['EXCHANGING', 'Swapping'],
  ['ANONYMIZING', 'Routing through Monero'],
  ['FINISHED', 'Arrived in your private wallet'],
];
const stepIndex = (label) => Math.max(0, STEPS.findIndex(([k]) => k === label));

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
function toIx(ix) {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    keys: ix.accounts.map((a) => ({ pubkey: new PublicKey(a.pubkey), isSigner: a.isSigner, isWritable: a.isWritable })),
    data: Buffer.from(ix.data, 'base64'),
  });
}
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };
const loadSession = () => { try { return JSON.parse(sessionStorage.getItem(SESSION) || 'null'); } catch { return null; } };
const saveSession = (v) => { try { v ? sessionStorage.setItem(SESSION, JSON.stringify(v)) : sessionStorage.removeItem(SESSION); } catch {} };

function Copy({ value, label = 'Copy' }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1400); }}>
      {ok ? <IconCheck /> : <IconCopy />} {ok ? 'Copied' : label}
    </button>
  );
}

function CoinIcon({ coin, size = 22 }) {
  const [ok, setOk] = useState(Boolean(coin?.icon));
  if (!ok) return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', background: 'var(--surface-3)', flex: 'none' }} />;
  return <img src={relay(coin.icon)} alt="" width={size} height={size} onError={() => setOk(false)} style={{ width: size, height: size, borderRadius: '50%', flex: 'none', background: '#1E1E21' }} />;
}

export default function MaxPrivacy({ product, pkgId, customValue, faceValue, onLock }) {
  const { connection } = useConnection();
  const [enabled, setEnabled] = useState(null);
  const [coins, setCoins] = useState([]);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [coin, setCoin] = useState(null);
  const [refund, setRefund] = useState('');
  const [kp, setKp] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | starting | deposit | arriving | buying | done
  // Once an order exists its card and amount are fixed, so the card picker is locked until it finishes.
  useEffect(() => { onLock?.(['starting', 'deposit', 'arriving', 'buying'].includes(phase)); }, [phase, onLock]);
  useEffect(() => () => onLock?.(false), [onLock]);
  const [order, setOrder] = useState(null);
  const [label, setLabel] = useState('WAITING');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [held, setHeld] = useState(false); // stop auto-retrying a purchase after it fails
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  // Feature flag + popular coins
  useEffect(() => {
    fetch('/api/houdini/tokens').then((r) => r.json()).then((d) => {
      setEnabled(d.enabled !== false && !d.error);
      setCoins(d.tokens || []);
      setCoin((c) => c || (d.tokens || [])[0] || null);
    }).catch(() => setEnabled(false));
  }, []);

  // One-time wallet for this order (kept for this tab only, so a refresh can resume)
  useEffect(() => {
    const s = loadSession();
    if (s?.secret) {
      try {
        setKp(Keypair.fromSecretKey(bs58.decode(s.secret)));
        if (s.order) { setOrder(s.order); setPhase(s.phase === 'done' ? 'idle' : 'deposit'); setSaved(true); }
        return;
      } catch {}
    }
    setKp(Keypair.generate());
  }, []);

  // Coin search
  useEffect(() => {
    const q = term.trim();
    if (!q) { setResults(null); return undefined; }
    const t = setTimeout(() => {
      fetch(`/api/houdini/tokens?term=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => setResults(d.tokens || [])).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [term]);

  const secret = useMemo(() => (kp ? bs58.encode(kp.secretKey) : ''), [kp]);
  const address = kp?.publicKey.toBase58() || '';
  const list = results ?? coins;
  const belowMin = product?.currency === 'USD' && Number(faceValue) > 0 && Number(faceValue) < 25;
  const ready = enabled && product && faceValue && !belowMin && coin && refund.trim().length >= 8 && saved && phase === 'idle';

  async function start() {
    setError('');
    setPhase('starting');
    try {
      const inv = await postJson('/api/invoice', { productId: product.id, packageId: pkgId || null, value: pkgId ? null : Number(customValue), wallet: address });
      if (inv.demo) throw new Error(inv.message || 'Demo mode: real gift cards aren’t switched on yet.');
      const o = await postJson('/api/houdini/start', { usdcAmount: inv.usdcAmount, fromId: coin.id, fromPrice: coin.price, refundAddress: refund.trim(), addressTo: address, timezone: tz() });
      const snap = { ...o, product: { id: product.id, name: product.name, currency: product.currency }, pkgId: pkgId || null, value: pkgId ? null : Number(customValue), faceValue, coinIcon: coin.icon };
      setOrder(snap);
      setLabel('WAITING');
      saveSession({ secret, order: snap, phase: 'deposit' });
      setPhase('deposit');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  // Buy the card from the private wallet: one transaction swaps SOL to the exact USDC
  // and pays the invoice. Signed here with the one-time key, so no wallet connection.
  const buy = useCallback(async (o) => {
    setPhase('buying');
    try {
      const inv = await postJson('/api/invoice', { productId: o.product.id, packageId: o.pkgId, value: o.value, wallet: address });
      const { quote } = await postJson('/api/jup/quote', { inputMint: SOL, usdcAtomic: inv.usdcAtomic });
      const built = await postJson('/api/jup/build', { quoteResponse: quote, userPublicKey: address, payTo: inv.payTo });
      const payTo = new PublicKey(inv.payTo);
      const usdc = new PublicKey(USDC);
      const dest = getAssociatedTokenAddressSync(usdc, payTo, true);
      const instructions = [
        ...(built.computeBudgetInstructions || []).map(toIx),
        createAssociatedTokenAccountIdempotentInstruction(kp.publicKey, dest, payTo, usdc),
        ...(built.setupInstructions || []).map(toIx),
        toIx(built.swapInstruction),
        ...(built.cleanupInstruction ? [toIx(built.cleanupInstruction)] : []),
        ...(built.otherInstructions || []).map(toIx),
      ];
      const luts = (await Promise.all((built.addressLookupTableAddresses || []).map((a) => connection.getAddressLookupTable(new PublicKey(a)).then((r) => r.value)))).filter(Boolean);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const tx = new VersionedTransaction(new TransactionMessage({ payerKey: kp.publicKey, recentBlockhash: blockhash, instructions }).compileToV0Message(luts));
      tx.sign([kp]);
      const sig = await connection.sendRawTransaction(tx.serialize(), { maxRetries: 3 });
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
      const entry = { id: inv.id, token: inv.accessToken, name: o.product.name, value: o.faceValue, currency: inv.currency, private: true, at: Date.now() };
      saveCards([entry, ...loadCards().filter((c) => c.id !== entry.id)]);
      for (let i = 0; i < 150 && alive.current; i++) {
        const d = await fetch(statusUrl(entry)).then((r) => r.json()).catch(() => ({}));
        if (d.status === 'complete' && d.redemption) {
          setResult({ name: o.product.name, redemption: d.redemption });
          setPhase('done');
          saveSession({ secret, order: o, phase: 'done' });
          return;
        }
        if (['expired', 'failed', 'refunded'].includes(d.status)) throw new Error(`The card order ${d.status}. The shop refunds to your private wallet; the key is above.`);
        await new Promise((r) => setTimeout(r, 4000));
      }
      throw new Error('Still wrapping your card. It’s saved under My cards.');
    } catch (e) {
      setError(/insufficient|0x1\b/i.test(e.message || '') ? 'Not enough SOL arrived to cover the card at today’s price. Your SOL is safe in the private wallet; the key is above.' : e.message);
      setHeld(true);
      setPhase('arriving');
    }
  }, [address, connection, kp, secret]);

  // Track the private route, then wait for the SOL to land and buy the card.
  useEffect(() => {
    if (!order || !['deposit', 'arriving'].includes(phase) || (phase === 'arriving' && held)) return undefined;
    let stop = false;
    (async () => {
      while (!stop && alive.current) {
        try {
          if (phase === 'deposit') {
            const d = await fetch(`/api/houdini/order/${order.houdiniId}?tz=${encodeURIComponent(tz())}`).then((r) => r.json());
            if (d.label) setLabel(d.label);
            if (d.label === 'FINISHED') { setPhase('arriving'); return; }
            if (['EXPIRED', 'DELETED'].includes(d.label)) { setError('The deposit window closed before anything arrived. Start again for a fresh address.'); setPhase('idle'); setOrder(null); saveSession({ secret }); return; }
            if (['FAILED', 'REFUNDED'].includes(d.label)) { setError('The private route couldn’t finish, so your coins were sent back to your refund address.'); setPhase('idle'); setOrder(null); saveSession({ secret }); return; }
          } else {
            const lamports = await connection.getBalance(kp.publicKey, 'confirmed');
            if (lamports / LAMPORTS_PER_SOL >= order.solNeeded * 0.97) { if (!stop) await buy(order); return; }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, phase === 'deposit' ? 10000 : 5000));
      }
    })();
    return () => { stop = true; };
  }, [order, phase, connection, kp, buy, secret, held]);

  function reset() {
    saveSession(null);
    setKp(Keypair.generate()); setSaved(false); setShowKey(false);
    setOrder(null); setResult(null); setError(''); setPhase('idle'); setLabel('WAITING'); setHeld(false);
  }

  if (enabled === false) {
    return (
      <div className="card" style={{ padding: 22, gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="fw-h">Max privacy is almost here</span>
        <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>This route sends your coins through Monero before they pay for anything. It switches on shortly. Private checkout works now.</p>
      </div>
    );
  }

  const idx = stepIndex(label);

  return (
    <>
      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, font: '500 17px var(--display)', letterSpacing: '-0.015em' }}><span className="step-num">02</span>Send any coin</span>
          <span className="label">Via Monero</span>
        </div>

        {phase === 'idle' || phase === 'starting' ? (
          <>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }}><IconSearch /></span>
              <input className="input" style={{ paddingLeft: 44 }} placeholder="Search BTC, ETH, XMR…" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search coins" spellCheck={false} />
            </div>
            <div className="mx-coins">
              {(list || []).slice(0, 18).map((c) => (
                <button key={c.id} type="button" className="mx-coin" aria-pressed={coin?.id === c.id} onClick={() => { setCoin(c); setRefund(''); }}>
                  <CoinIcon coin={c} />
                  <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{c.symbol}</span>
                    <span className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.chainName}</span>
                  </span>
                </button>
              ))}
              {enabled === null && Array.from({ length: 6 }, (_, i) => <span key={i} className="skeleton" style={{ height: 50 }} />)}
              {results && results.length === 0 && <span className="muted" style={{ fontSize: 14, gridColumn: '1 / -1' }}>No coins found.</span>}
            </div>
            {coin && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="label">Your {coin.symbol} refund address ({coin.chainName})</span>
                <input className="input" value={refund} onChange={(e) => setRefund(e.target.value)} placeholder="Paste your address" spellCheck={false} />
                <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>Only used if the private route can’t finish. Use your own wallet, not an exchange.</span>
              </label>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <span className="label">How the route works</span>
              <ol className="next-steps">
                <li><b>You send {coin?.symbol || 'your coin'} to a one-time address.</b> From any wallet, on its own chain.</li>
                <li><b>It’s swapped through Monero.</b> Monero hides amounts and addresses, so the trail stops there.</li>
                <li><b>SOL lands in your new wallet and buys the card.</b> Nothing on-chain ties it back to you.</li>
              </ol>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="mx-steps" aria-label="Progress">
              {STEPS.map(([k, t], i) => (
                <div key={k} className="mx-step" data-state={phase === 'deposit' ? (i < idx ? 'done' : i === idx ? 'now' : 'todo') : 'done'}>
                  <span className="mx-dot" />{t}
                </div>
              ))}
              <div className="mx-step" data-state={phase === 'buying' ? 'now' : phase === 'done' ? 'done' : 'todo'}><span className="mx-dot" />Buying your card</div>
            </div>
            {order?.eta ? <span className="muted" style={{ fontSize: 13 }}>Usually about {order.eta} minutes once your deposit confirms. You can leave this tab open and come back.</span> : null}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, font: '500 17px var(--display)', letterSpacing: '-0.015em' }}><span className="step-num">03</span>{phase === 'idle' || phase === 'starting' ? 'Your private wallet' : phase === 'done' ? 'Your card' : 'Deposit'}</span>
          <span className="label">One-time</span>
        </div>

        {(phase === 'idle' || phase === 'starting') && kp && (
          <>
            <OrderSummary product={product} faceValue={faceValue} rows={[['Paying with', coin ? `${coin.symbol} on ${coin.chainName}` : '—'], ['GiftedSwaps fee', '$0'], ['Usually takes', '15–45 minutes']]} />
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>Your coins come out of Monero as SOL in this brand-new wallet, then it pays for the card on its own. Leftover SOL stays yours.</p>
            <span className="label">One-time wallet address</span>
            <div className="key-line" style={{ padding: '10px 12px', marginTop: -8 }}><code style={{ fontSize: 12.5 }}>{address}</code></div>
            <span className="label">Backup key <span className="dim">(keep it secret, it controls this wallet)</span></span>
            <button type="button" className="key-line key-secret" data-shown={showKey} onClick={() => setShowKey(true)} style={{ padding: '10px 12px', marginTop: -8 }} aria-label={showKey ? 'Private key' : 'Show private key'}>
              <code className="code-text" style={{ fontSize: 12.5 }} aria-hidden={!showKey}>{secret}</code>
              {!showKey && <span className="code-cover"><IconEyeOff width={15} height={15} /> Show backup key</span>}
            </button>
            {showKey && <div><Copy value={secret} label="Copy backup key" /></div>}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <label className="fw-check"><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} /><span>I saved the backup key</span></label>
              {belowMin && <span className="notice notice-info" style={{ fontSize: 13 }}>Max privacy starts at $25. Pick a bigger amount, or use Private checkout for this one.</span>}
              <button type="button" className="btn btn-primary" disabled={!ready} onClick={start}>{phase === 'starting' ? 'Finding a private route…' : 'Get my deposit address'}</button>
              <p className="fw-note" style={{ fontSize: 12.5 }}><IconShield width={15} height={15} /> Houdini needs your IP, browser and timezone for its own screening. We pass them along and keep nothing.</p>
            </div>
          </>
        )}

        {['deposit', 'arriving', 'buying'].includes(phase) && order && (
          <>
            {phase === 'deposit' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                <QrCode value={order.depositAddress} size={136} />
                <div style={{ flex: '1 1 180px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="label">Send exactly</span>
                  <CopyAmount amount={order.inAmount} symbol={order.inSymbol} />
                  <span className="label">To this address{order.fromChain ? ` (${order.fromChain})` : ''}</span>
                  <code style={{ font: '500 12.5px var(--code)', wordBreak: 'break-all' }}>{order.depositAddress}</code>
                  {order.depositTag && <span style={{ fontSize: 13 }}>Memo / tag: <code>{order.depositTag}</code> <span className="muted">(required)</span></span>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Copy value={order.depositAddress} label="Copy address" /><Copy value={String(order.inAmount)} label="Copy amount" /></div>
                </div>
              </div>
            )}
            {phase === 'deposit' && label === 'WAITING' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>Change card or start over</button>
            )}
            {phase === 'deposit' && label === 'WAITING' && (
              <span className="muted" style={{ fontSize: 12.5 }}>Only start over if you haven’t sent anything yet.</span>
            )}
            {phase === 'deposit' && order.expires && <span className="muted" style={{ fontSize: 12.5 }}>Send within {Math.max(0, Math.round((new Date(order.expires) - Date.now()) / 60000))} minutes. {order.exact ? 'The SOL that arrives is locked in.' : 'Rate isn’t locked, so we added a little headroom.'}</span>}
            {phase === 'arriving' && !held && <div className="notice notice-info" role="status">SOL is arriving in your private wallet. Buying the card as soon as it lands…</div>}
            {phase === 'arriving' && held && <button type="button" className="btn btn-primary" onClick={() => { setError(''); setHeld(false); }}>Try buying again</button>}
            {phase === 'buying' && <div className="notice notice-info" role="status">Buying your card from the private wallet…</div>}
          </>
        )}

        {phase === 'done' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="notice notice-ok">Your {result.name} card is ready. Paid with Max privacy.</div>
            <RevealCode code={result.redemption.code} />
            {result.redemption.instructions && <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{result.redemption.instructions}</p>}
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>Start a new order</button>
          </div>
        )}

        {error && <div className="notice notice-warn" role="alert">{error}</div>}
      </div>
    </>
  );
}
