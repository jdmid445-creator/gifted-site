'use client';

import RedeemSteps from './RedeemSteps';

// Private checkout: the gift card invoice is paid by NEAR Intents' solvers, so the payment that
// reaches the shop comes from the network instead of your wallet. You send to a one-time
// deposit address (one tap with a Solana wallet, or from any wallet on any listed chain).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import QrCode from './QrCode';
import OrderSummary from './OrderSummary';
import CopyAmount from './CopyAmount';
import RevealCode from './RevealCode';
import { CHAINS, getChain, isValidAddress } from '@/lib/chains';
import { loadCards, saveCards, statusUrl } from '@/lib/cards';

const STATUS_TEXT = {
  PENDING_DEPOSIT: 'Waiting for your deposit',
  KNOWN_DEPOSIT_TX: 'Deposit seen, confirming',
  PROCESSING: 'Paying the shop privately',
  SUCCESS: 'Shop paid, wrapping your card',
  INCOMPLETE_DEPOSIT: 'Deposit was short. It will be refunded',
  REFUNDED: 'Refunded to your refund address',
  FAILED: 'Something went wrong. Funds are refunded',
};

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function fmtUnits(raw, decimals) {
  if (raw == null) return '';
  const s = String(raw).padStart(decimals + 1, '0');
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole;
}

function Copy({ value, label = 'Copy' }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-ghost" style={{ minHeight: 40, padding: '0 14px' }}
      onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1400); }}>
      {ok ? 'Copied' : label}
    </button>
  );
}

export default function PrivateCheckout({ product, pkgId, customValue, faceValue, onLock }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [tokens, setTokens] = useState([]);
  const [chain, setChain] = useState('sol');
  const [assetId, setAssetId] = useState('');
  const [refundTo, setRefundTo] = useState('');
  const [shopRefund, setShopRefund] = useState('');
  const [agree, setAgree] = useState(false);

  const [order, setOrder] = useState(null); // { invoice, quote }
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | quoting | deposit | sending | tracking | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const trackId = useRef(0);

  // While a deposit address is out, the order is fixed: lock the card picker so the amount can't drift.
  useEffect(() => { onLock?.(['quoting', 'deposit', 'sending', 'tracking'].includes(phase)); }, [phase, onLock]);
  useEffect(() => () => onLock?.(false), [onLock]);

  function startOver() {
    trackId.current += 1; // stops the status loop for the old order (it stays saved under My cards)
    setOrder(null); setStatus(null); setError(''); setPhase('idle');
  }

  useEffect(() => {
    fetch('/api/private/tokens').then((r) => r.json()).then((d) => setTokens(d.tokens || [])).catch(() => setError('Private checkout is unavailable right now.'));
  }, []);


  // Each chain opens on its own coin, then stablecoins, then the rest A to Z (ignoring a leading $).
  const chainTokens = useMemo(() => {
    const NATIVE = { sol: 'SOL', eth: 'ETH', base: 'ETH', arb: 'ETH', bsc: 'BNB', btc: 'BTC', ltc: 'LTC', doge: 'DOGE' };
    const rank = (t) => (t.symbol === NATIVE[chain] || (!t.contractAddress && !NATIVE[chain]) ? 0 : ['USDC', 'USDT'].includes(t.symbol) ? 1 : 2);
    const name = (t) => t.symbol.replace(/^\$/, '').toUpperCase();
    return tokens.filter((t) => t.blockchain === chain).sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b)));
  }, [tokens, chain]);
  useEffect(() => {
    if (!chainTokens.find((t) => t.assetId === assetId)) setAssetId(chainTokens[0]?.assetId || '');
  }, [chainTokens]); // eslint-disable-line react-hooks/exhaustive-deps

  const token = chainTokens.find((t) => t.assetId === assetId) || null;
  const chainInfo = getChain(chain);
  // Pick up a fresh address made in the /fresh-wallet tab.
  useEffect(() => {
    const take = (raw) => { try { const v = JSON.parse(raw || 'null'); if (v?.address && Date.now() - v.at < 3600_000) setShopRefund(v.address); } catch {} };
    const onStorage = (e) => { if (e.key === 'gifted.freshSol') take(e.newValue); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const cardRefund = shopRefund;
  const sameWallet = cardRefund.trim() && (cardRefund.trim() === refundTo.trim() || cardRefund.trim() === publicKey?.toBase58());
  const ready = product && faceValue && token && isValidAddress(chain, refundTo) && isValidAddress('sol', cardRefund) && agree && phase === 'idle';

  async function start() {
    setError('');
    setPhase('quoting');
    try {
      const invoice = await postJson('/api/invoice', {
        productId: product.id,
        packageId: pkgId || null,
        value: pkgId ? null : Number(customValue),
        wallet: cardRefund.trim(),
      });
      if (invoice.demo) throw new Error(invoice.message);
      const quote = await postJson('/api/private/quote', { invoiceId: invoice.id, token: invoice.accessToken, originAsset: token.assetId, refundTo: refundTo.trim() });
      if (!quote.depositAddress) throw new Error('The network did not return a deposit address. Try again.');
      const entry = { id: invoice.id, token: invoice.accessToken, name: product.name, value: faceValue, currency: invoice.currency, private: true, depositAddress: quote.depositAddress, at: Date.now() };
      saveCards([entry, ...loadCards().filter((c) => c.id !== entry.id)]);
      setOrder({ invoice, quote, entry });
      setPhase('deposit');
      track(entry, quote.depositAddress);
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  async function payWithWallet() {
    const q = order.quote;
    setError('');
    setPhase('sending');
    try {
      const to = new PublicKey(q.depositAddress);
      const amount = BigInt(q.amountIn);
      const tx = new Transaction();
      const isNative = !q.contractAddress || q.symbol === 'SOL' || q.symbol === 'wSOL';
      if (isNative) {
        tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: to, lamports: amount }));
      } else {
        const mint = new PublicKey(q.contractAddress);
        const info = await connection.getAccountInfo(mint);
        const programId = info.owner;
        const src = getAssociatedTokenAddressSync(mint, publicKey, false, programId);
        const dst = getAssociatedTokenAddressSync(mint, to, true, programId);
        tx.add(createAssociatedTokenAccountIdempotentInstruction(publicKey, dst, to, mint, programId));
        tx.add(createTransferCheckedInstruction(src, mint, dst, publicKey, amount, q.decimals, [], programId));
      }
      const sig = await sendTransaction(tx, connection);
      postJson('/api/private/submit', { txHash: sig, depositAddress: q.depositAddress }).catch(() => {});
      setPhase('tracking');
    } catch (e) {
      setError(/reject|denied|cancel/i.test(e.message || '') ? 'You cancelled in your wallet. You can still send to the deposit address yourself.' : e.message);
      setPhase('deposit');
    }
  }

  async function track(entry, depositAddress) {
    const me = ++trackId.current;
    for (let i = 0; i < 720; i++) {
      if (trackId.current !== me) return;
      try {
        const s = await fetch(`/api/private/status?depositAddress=${encodeURIComponent(depositAddress)}`).then((r) => r.json());
        if (s.status) setStatus(s.status);
        if (['KNOWN_DEPOSIT_TX', 'PROCESSING', 'SUCCESS'].includes(s.status)) setPhase((p) => (p === 'deposit' ? 'tracking' : p));
        if (['REFUNDED', 'FAILED'].includes(s.status)) { setPhase('idle'); setError(STATUS_TEXT[s.status]); return; }
        // Check the card itself once the shop is paid, and every few rounds anyway in case the network's status lags.
        if (s.status === 'SUCCESS' || i % 4 === 3) {
          const inv = await fetch(statusUrl(entry)).then((r) => r.json());
          if (inv.status === 'complete' && inv.redemption) { setResult({ ...entry, redemption: inv.redemption }); setPhase('done'); return; }
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 2500));
    }
    setError('Still working on it. Your order is saved under My cards, so you can check back.');
  }

  const q = order?.quote;
  const sendAmount = q ? (q.amountInFormatted || fmtUnits(q.amountIn, q.decimals)) : '';

  return (
    <>
      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, font: '500 17px var(--display)', letterSpacing: '-0.015em' }}><span className="step-num">02</span>Pay privately</span>
          <span className="label">8 chains</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Paying from</span>
            <select className="input" value={chain} onChange={(e) => { setChain(e.target.value); setRefundTo(''); }} disabled={phase !== 'idle'}>
              {CHAINS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Coin</span>
            <select className="input" value={assetId} onChange={(e) => setAssetId(e.target.value)} disabled={phase !== 'idle' || !chainTokens.length}>
              {chainTokens.length ? chainTokens.map((t) => <option key={t.assetId} value={t.assetId}>{t.symbol}</option>) : <option>Loading…</option>}
            </select>
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Your {chainInfo?.label} wallet address</span>
          <input className="input" value={refundTo} onChange={(e) => setRefundTo(e.target.value)} placeholder="Paste your address" disabled={phase !== 'idle'} spellCheck={false} />
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
            {chain === 'sol' ? 'If anything goes wrong, your money comes back here.' : 'If the payment doesn’t go through, your money comes back here.'} Use your own wallet, not an exchange.
          </span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Backup Solana address</span>
          <input className="input" value={shopRefund} onChange={(e) => setShopRefund(e.target.value)} placeholder="A fresh Solana wallet" disabled={phase !== 'idle'} spellCheck={false} />
          <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>Only used if the card can’t be delivered (refund in USDC). The shop sees this one, so use a fresh wallet, not the one you pay from.</span>
          <a href="/fresh-wallet" target="_blank" rel="noopener" style={{ fontSize: 13, alignSelf: 'flex-start' }}>Need a fresh wallet? Make one here ↗</a>
          {sameWallet && <span className="notice notice-warn" style={{ fontSize: 13 }}>That’s the wallet you’re paying from. It works, but the shop would see it. A fresh wallet keeps you private.</span>}
        </label>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <span className="label">Pay from any of these</span>
          <div className="chain-grid">
            {CHAINS.map((c) => (
              <button key={c.key} type="button" className="chain-tile" aria-pressed={chain === c.key} disabled={phase !== 'idle'}
                onClick={() => { if (c.key !== chain) { setChain(c.key); setRefundTo(''); } }}>
                <img src={`/chains/${c.key}.svg`} alt="" width={22} height={22} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, font: '500 17px var(--display)', letterSpacing: '-0.015em' }}><span className="step-num">03</span>Deposit address</span>
          <span className="label">No connecting</span>
        </div>

        {phase === 'idle' && (
          <>
            <OrderSummary product={product} faceValue={faceValue} rows={[['Paying with', token ? `${token.symbol} on ${chainInfo?.label}` : '—'], ['GiftedSwaps fee', '$0'], ['Usually takes', 'About a minute']]} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label">What happens next</span>
              <ol className="next-steps">
                <li><b>You get a one-time address.</b> Send the exact amount from any wallet.</li>
                <li><b>The network pays the shop.</b> Your wallet is never part of that payment.</li>
                <li><b>Your code shows up here.</b> It’s also saved under My cards.</li>
              </ol>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
              <span>Got it: the shop never sees my wallet. My deposit itself is still visible on the blockchain.</span>
            </label>
            <button className="btn btn-primary" type="button" disabled={!ready} onClick={start}>Get my deposit address</button>
            </div>
          </>
        )}
        {phase === 'quoting' && <span className="muted" role="status">Setting up your private order…</span>}

        {q && ['deposit', 'sending', 'tracking'].includes(phase) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Gift card</span><span>{order.entry.name} · {order.entry.value} {order.invoice.currency}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span className="muted">Send exactly</span><CopyAmount amount={sendAmount} symbol={q.symbol} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Usually takes</span><span>About a minute once your deposit lands</span></div>
            {phase === 'deposit' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: 16, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <QrCode value={q.depositAddress} size={150} />
                <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="label">Send to this address ({chainInfo?.label})</span>
                  <code style={{ wordBreak: 'break-all', font: '500 14px var(--code)' }}>{q.depositAddress}</code>
                  {q.depositMemo && <span>Memo: <code>{q.depositMemo}</code></span>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Copy value={q.depositAddress} label="Copy address" />
                    <Copy value={sendAmount} label="Copy amount" />
                  </div>
                </div>
              </div>
            )}
            {phase === 'sending' && <span className="muted" role="status">Approve the deposit in your wallet…</span>}
            <div className="notice notice-info" role="status">Status: {STATUS_TEXT[status] || 'Waiting for your deposit'}</div>
            {phase === 'deposit' && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>Change card or start over</button>
            )}
          </div>
        )}

        {phase === 'done' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="notice notice-ok">Your {result.name} card is ready, paid privately.</div>
            <RevealCode code={result.redemption.code} />
            {result.redemption.instructions && <RedeemSteps text={result.redemption.instructions} size={14} />}
          </div>
        )}

        {error && <div className="notice notice-warn" role="alert">{error}</div>}
      </div>
    </>
  );
}
