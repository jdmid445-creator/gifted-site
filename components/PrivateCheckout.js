'use client';

// Private checkout: the gift card invoice is paid by NEAR Intents' solvers, so the payment that
// reaches the shop comes from the network instead of your wallet. You send to a one-time
// deposit address (one tap with a Solana wallet, or from any wallet on any listed chain).
import { useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import QrCode from './QrCode';
import { CHAINS, getChain, isValidAddress } from '@/lib/chains';
import { loadCards, saveCards } from '@/lib/cards';

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

function Copy({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-ghost" style={{ minHeight: 40, padding: '0 14px' }}
      onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1400); }}>
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function PrivateCheckout({ product, pkgId, customValue, faceValue }) {
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

  useEffect(() => {
    fetch('/api/private/tokens').then((r) => r.json()).then((d) => setTokens(d.tokens || [])).catch(() => setError('Private checkout is unavailable right now.'));
  }, []);

  // Prefill refund addresses from a connected Solana wallet (you can replace them with fresh ones).
  useEffect(() => {
    if (!publicKey) return;
    const a = publicKey.toBase58();
    if (chain === 'sol' && !refundTo) setRefundTo(a);
    if (!shopRefund) setShopRefund(a);
  }, [publicKey, chain]); // eslint-disable-line react-hooks/exhaustive-deps

  const chainTokens = useMemo(() => tokens.filter((t) => t.blockchain === chain).sort((a, b) => a.symbol.localeCompare(b.symbol)), [tokens, chain]);
  useEffect(() => {
    if (!chainTokens.find((t) => t.assetId === assetId)) setAssetId(chainTokens[0]?.assetId || '');
  }, [chainTokens]); // eslint-disable-line react-hooks/exhaustive-deps

  const token = chainTokens.find((t) => t.assetId === assetId) || null;
  const chainInfo = getChain(chain);
  const ready = product && faceValue && token && isValidAddress(chain, refundTo) && isValidAddress('sol', shopRefund) && agree && phase === 'idle';

  async function start() {
    setError('');
    setPhase('quoting');
    try {
      const invoice = await postJson('/api/invoice', {
        productId: product.id,
        packageId: pkgId || null,
        value: pkgId ? null : Number(customValue),
        wallet: shopRefund.trim(),
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
    for (let i = 0; i < 360; i++) {
      try {
        const s = await fetch(`/api/private/status?depositAddress=${encodeURIComponent(depositAddress)}`).then((r) => r.json());
        if (s.status) setStatus(s.status);
        if (['KNOWN_DEPOSIT_TX', 'PROCESSING'].includes(s.status)) setPhase((p) => (p === 'deposit' ? 'tracking' : p));
        if (['REFUNDED', 'FAILED'].includes(s.status)) { setPhase('idle'); setError(STATUS_TEXT[s.status]); return; }
        if (s.status === 'SUCCESS') {
          const inv = await fetch(`/api/invoice/${encodeURIComponent(entry.id)}?token=${encodeURIComponent(entry.token)}`).then((r) => r.json());
          if (inv.status === 'complete' && inv.redemption) { setResult({ ...entry, redemption: inv.redemption }); setPhase('done'); return; }
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 5000));
    }
    setError('Still working on it. Your order is saved under My cards, so you can check back.');
  }

  const q = order?.quote;
  const sendAmount = q ? (q.amountInFormatted || fmtUnits(q.amountIn, q.decimals)) : '';

  return (
    <>
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="label">2 · Pay privately</span>
        <div className="notice notice-info">
          The shop gets paid by the NEAR Intents network, not by your wallet. Your wallet only shows a deposit into the network.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Pay from chain</span>
            <select className="input" value={chain} onChange={(e) => { setChain(e.target.value); setRefundTo(''); }} disabled={phase !== 'idle'}>
              {CHAINS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">Pay with</span>
            <select className="input" value={assetId} onChange={(e) => setAssetId(e.target.value)} disabled={phase !== 'idle' || !chainTokens.length}>
              {chainTokens.length ? chainTokens.map((t) => <option key={t.assetId} value={t.assetId}>{t.symbol}</option>) : <option>Loading…</option>}
            </select>
          </label>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Refund address on {chainInfo?.label}</span>
          <input className="input" value={refundTo} onChange={(e) => setRefundTo(e.target.value)} placeholder={`Your ${chainInfo?.label} address`} disabled={phase !== 'idle'} spellCheck={false} />
          <span className="muted" style={{ fontSize: 13 }}>Only used if the swap fails. Use a wallet you control, not an exchange.</span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Card refund address (Solana)</span>
          <input className="input" value={shopRefund} onChange={(e) => setShopRefund(e.target.value)} placeholder="A Solana address" disabled={phase !== 'idle'} spellCheck={false} />
          <span className="muted" style={{ fontSize: 13 }}>The shop refunds here if a card can’t be delivered. For more privacy, use a fresh wallet instead of your main one.</span>
        </label>
      </div>

      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="label">3 · Review and pay</span>

        {phase === 'idle' && (
          <>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
              <span>I understand private checkout hides the link between my wallet and the shop’s payment, but my deposit into the network is still public, and the card is tied to whatever account I redeem it on.</span>
            </label>
            <button className="btn btn-primary" type="button" disabled={!ready} onClick={start}>Get private deposit address</button>
          </>
        )}
        {phase === 'quoting' && <span className="muted" role="status">Creating your order and a private route…</span>}

        {q && ['deposit', 'sending', 'tracking'].includes(phase) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Gift card</span><span>{product.name} · {faceValue} {order.invoice.currency}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Send exactly</span><strong>{sendAmount} {q.symbol}</strong></div>
            {q.timeEstimate ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Usually takes</span><span>~{q.timeEstimate}s after your deposit lands</span></div> : null}
            {phase === 'deposit' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: 16, borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <QrCode value={q.depositAddress} size={150} />
                <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="label">One-time deposit address on {chainInfo?.label}</span>
                  <code style={{ wordBreak: 'break-all', font: '600 14px ui-monospace, monospace' }}>{q.depositAddress}</code>
                  {q.depositMemo && <span>Memo: <code>{q.depositMemo}</code></span>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Copy value={q.depositAddress} />
                    {chain === 'sol' && connected && <button type="button" className="btn btn-primary" style={{ minHeight: 40 }} onClick={payWithWallet}>Pay with wallet</button>}
                  </div>
                </div>
              </div>
            )}
            {phase === 'sending' && <span className="muted" role="status">Approve the deposit in your wallet…</span>}
            <div className="notice notice-info" role="status">Status: {STATUS_TEXT[status] || 'Waiting for your deposit'}</div>
          </div>
        )}

        {phase === 'done' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="notice notice-ok">Your {result.name} card is ready, paid privately.</div>
            {result.redemption.code && <div className="code-box">{result.redemption.code}</div>}
            {result.redemption.instructions && <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>{result.redemption.instructions}</p>}
          </div>
        )}

        {error && <div className="notice notice-warn" role="alert">{error}</div>}
      </div>
    </>
  );
}
