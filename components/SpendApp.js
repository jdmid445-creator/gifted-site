'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { Buffer } from 'buffer';
import Link from 'next/link';
import Mascot from './Mascot';
import { loadCards, saveCards } from '@/lib/cards';
import PrivateCheckout from './PrivateCheckout';

const USDC = 'EPjFWdd5AufqSSqeM2qy1xbybapC8G4wEGGkZwyTDt1v';
const SOL = 'So11111111111111111111111111111111111111112';

const short = (s) => (s ? `${s.slice(0, 4)}…${s.slice(-4)}` : '');
const fmt = (n, d = 4) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : '—');

function toIx(ix) {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    keys: ix.accounts.map((a) => ({ pubkey: new PublicKey(a.pubkey), isSigner: a.isSigner, isWritable: a.isWritable })),
    data: Buffer.from(ix.data, 'base64'),
  });
}

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export default function SpendApp() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  // catalog
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [product, setProduct] = useState(null);
  const [pkgId, setPkgId] = useState(null);
  const [customValue, setCustomValue] = useState('');

  // wallet holdings
  const [holdings, setHoldings] = useState([]);
  const [payMint, setPayMint] = useState(null);

  // checkout
  const [invoice, setInvoice] = useState(null);
  const [quote, setQuote] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | quoting | ready | signing | waiting | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cards, setCards] = useState([]);
  const [mode, setMode] = useState('standard'); // standard | private

  useEffect(() => { setCards(loadCards()); }, []);

  // ---- catalog search
  const search = useCallback(async (q) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load gift cards');
      setProducts(data.products || []);
      setDemo(Boolean(data.demo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { search(''); }, [search]);

  // ---- holdings
  useEffect(() => {
    if (!publicKey) { setHoldings([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const [lamports, a, b] = await Promise.all([
          connection.getBalance(publicKey),
          connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
          connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID }),
        ]);
        const list = [{ mint: SOL, amount: lamports / LAMPORTS_PER_SOL, decimals: 9 }];
        for (const acc of [...a.value, ...b.value]) {
          const info = acc.account.data.parsed?.info;
          const amt = info?.tokenAmount;
          if (amt && Number(amt.uiAmount) > 0) list.push({ mint: info.mint, amount: Number(amt.uiAmount), decimals: amt.decimals });
        }
        const metaRes = await fetch(`/api/tokens?mints=${list.map((h) => h.mint).slice(0, 50).join(',')}`).then((r) => r.json()).catch(() => ({}));
        const meta = metaRes.tokens || {};
        const withMeta = list.map((h) => {
          const m = meta[h.mint] || {};
          const symbol = h.mint === SOL ? 'SOL' : h.mint === USDC ? 'USDC' : m.symbol || short(h.mint);
          const usd = m.usdPrice != null ? h.amount * m.usdPrice : null;
          return { ...h, symbol, name: m.name || '', icon: m.icon || null, usdPrice: m.usdPrice ?? null, usd };
        });
        withMeta.sort((x, y) => (y.usd ?? -1) - (x.usd ?? -1));
        if (!cancelled) setHoldings(withMeta);
      } catch {
        if (!cancelled) setError('Could not read your wallet. Your RPC may be rate-limited.');
      }
    })();
    return () => { cancelled = true; };
  }, [publicKey, connection]);

  const payToken = useMemo(() => holdings.find((h) => h.mint === payMint) || null, [holdings, payMint]);

  const faceValue = useMemo(() => {
    if (!product) return null;
    if (pkgId) return product.packages.find((p) => p.id === pkgId)?.value ?? null;
    const v = Number(customValue);
    return product.range && Number.isFinite(v) && v >= product.range.min && v <= product.range.max ? v : null;
  }, [product, pkgId, customValue]);

  const resetCheckout = () => { setInvoice(null); setQuote(null); setPhase('idle'); setError(''); };

  // ---- step 1: invoice + quote
  async function getQuote() {
    setError('');
    setPhase('quoting');
    try {
      const inv = await postJson('/api/invoice', {
        productId: product.id,
        packageId: pkgId || null,
        value: pkgId ? null : Number(customValue),
        wallet: publicKey.toBase58(),
      });
      setInvoice(inv);
      if (inv.demo) { setQuote(null); setPhase('ready'); return; }
      if (payMint === USDC) {
        setQuote({ direct: true });
      } else {
        const { quote: q } = await postJson('/api/jup/quote', { inputMint: payMint, usdcAtomic: inv.usdcAtomic });
        setQuote(q);
      }
      setPhase('ready');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  // ---- step 2: build, sign, send
  async function pay() {
    setError('');
    setPhase('signing');
    try {
      const user = publicKey;
      const payTo = new PublicKey(invoice.payTo);
      const usdcMint = new PublicKey(USDC);
      const destAta = getAssociatedTokenAddressSync(usdcMint, payTo, true);
      const createDest = createAssociatedTokenAccountIdempotentInstruction(user, destAta, payTo, usdcMint);

      let instructions = [];
      let lookupTables = [];

      if (quote.direct) {
        const srcAta = getAssociatedTokenAddressSync(usdcMint, user);
        instructions = [
          createDest,
          createTransferCheckedInstruction(srcAta, usdcMint, destAta, user, BigInt(invoice.usdcAtomic), 6),
        ];
      } else {
        const built = await postJson('/api/jup/build', { quoteResponse: quote, userPublicKey: user.toBase58(), payTo: invoice.payTo });
        instructions = [
          ...(built.computeBudgetInstructions || []).map(toIx),
          createDest,
          ...(built.setupInstructions || []).map(toIx),
          toIx(built.swapInstruction),
          ...(built.cleanupInstruction ? [toIx(built.cleanupInstruction)] : []),
          ...(built.otherInstructions || []).map(toIx),
        ];
        const alts = await Promise.all(
          (built.addressLookupTableAddresses || []).map((a) => connection.getAddressLookupTable(new PublicKey(a)).then((r) => r.value))
        );
        lookupTables = alts.filter(Boolean);
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const msg = new TransactionMessage({ payerKey: user, recentBlockhash: blockhash, instructions }).compileToV0Message(lookupTables);
      const tx = new VersionedTransaction(msg);
      const signature = await sendTransaction(tx, connection);
      setPhase('waiting');
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

      const entry = { id: invoice.id, token: invoice.accessToken, name: product.name, value: faceValue, currency: invoice.currency, signature, at: Date.now() };
      const next = [entry, ...cards.filter((c) => c.id !== entry.id)];
      setCards(next);
      saveCards(next);
      pollInvoice(entry);
    } catch (e) {
      setError(e.message?.includes('User rejected') ? 'You cancelled the transaction.' : e.message);
      setPhase('ready');
    }
  }

  async function pollInvoice(entry) {
    for (let i = 0; i < 150; i++) {
      try {
        const res = await fetch(`/api/invoice/${encodeURIComponent(entry.id)}?token=${encodeURIComponent(entry.token)}`);
        const data = await res.json();
        if (data.status === 'complete' && data.redemption) {
          setResult({ ...entry, redemption: data.redemption });
          setPhase('done');
          return;
        }
        if (['expired', 'failed', 'refunded'].includes(data.status)) {
          setError(`The order ${data.status}. If you paid, Bitrefill refunds to your wallet.`);
          setPhase('idle');
          return;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 4000));
    }
    setError('Still waiting on the card. It is saved under "Your cards" below, so you can check back.');
    setPhase('idle');
  }

  const canQuote = connected && product && faceValue && payMint && phase === 'idle';
  const maxIn = quote && !quote.direct && payToken ? Number(quote.otherAmountThreshold || quote.inAmount) / 10 ** payToken.decimals : null;
  const demoEstimate = invoice?.demo && payToken?.usdPrice ? invoice.faceValue / payToken.usdPrice : null;

  return (
    <section className="wrap" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Mascot size={64} variant="icon" title="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h1 style={{ margin: 0, font: '800 34px var(--display)', letterSpacing: '-0.03em' }}>Spend a bag</h1>
            <span className="muted" style={{ fontSize: 14 }}>Any token in, gift card out.</span>
          </div>
        </div>
        <WalletMultiButton />
      </div>

      {demo && (
        <div className="notice notice-info" role="status">
          <strong>Demo mode.</strong> This is a sample catalog. Real gift cards turn on once Bitrefill API credentials are added.
        </div>
      )}

      {/* 1. card */}
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="label">1 · Pick a gift card</span>
        <form onSubmit={(e) => { e.preventDefault(); search(query); }} style={{ display: 'flex', gap: 8 }}>
          <label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Search brands</label>
          <input id="q" className="input" placeholder="Search brands (Amazon, Steam, Uber Eats…)" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-ghost" type="submit">Search</button>
        </form>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {loadingProducts && <span className="muted">Loading…</span>}
          {!loadingProducts && products.length === 0 && <span className="muted">No cards found. Try another brand.</span>}
          {products.map((p) => (
            <button key={p.id} type="button" className="pick" aria-pressed={product?.id === p.id}
              onClick={() => { setProduct(p); setPkgId(p.packages[0]?.id || null); setCustomValue(''); resetCheckout(); }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 15px var(--display)', color: 'var(--gold)' }}>
                {p.name.slice(0, 1)}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <span className="muted" style={{ fontSize: 13 }}>{p.country || 'Global'} · {p.currency}</span>
              </span>
            </button>
          ))}
        </div>

        {product && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="label">Amount</span>
            {product.packages.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.packages.map((k) => (
                  <button key={k.id} type="button" className="chip" aria-pressed={pkgId === k.id} onClick={() => { setPkgId(k.id); resetCheckout(); }}>
                    {k.value} {product.currency}
                  </button>
                ))}
              </div>
            ) : product.range ? (
              <>
                <label htmlFor="amt" className="muted" style={{ fontSize: 14 }}>
                  Any amount from {product.range.min} to {product.range.max} {product.currency}
                </label>
                <input id="amt" className="input" inputMode="decimal" value={customValue}
                  onChange={(e) => { setCustomValue(e.target.value); setPkgId(null); resetCheckout(); }} />
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="mode-switch" role="group" aria-label="Checkout mode">
        <button type="button" aria-pressed={mode === 'standard'} onClick={() => { setMode('standard'); resetCheckout(); }}>Standard</button>
        <button type="button" aria-pressed={mode === 'private'} onClick={() => { setMode('private'); resetCheckout(); }}>Private</button>
      </div>
      <p className="muted" style={{ margin: '-8px 0 0', fontSize: 14, lineHeight: 1.5 }}>
        {mode === 'standard' ? 'Fastest: one signature, paid straight from your wallet.' : 'The shop is paid by the NEAR Intents network, so the payment isn’t linked to your wallet on-chain. Pay from Solana, Ethereum, Base, Bitcoin and more.'}
      </p>

      {mode === 'private' ? (
        <PrivateCheckout product={product} pkgId={pkgId} customValue={customValue} faceValue={faceValue} />
      ) : (
      <>
      {/* 2. token */}
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="label">2 · Pay with any token</span>
        {!connected && <span className="muted">Connect your wallet to see what you can pay with.</span>}
        {connected && holdings.length === 0 && <span className="muted">Reading your wallet…</span>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
          {holdings.map((h) => (
            <button key={h.mint} type="button" className="pick" aria-pressed={payMint === h.mint} onClick={() => { setPayMint(h.mint); resetCheckout(); }}>
              {h.icon ? (
                <img src={h.icon} alt="" width="32" height="32" style={{ borderRadius: 16, flex: 'none' }} />
              ) : (
                <span style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--surface-2)', flex: 'none' }} aria-hidden="true" />
              )}
              <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>{h.symbol}</span>
                <span className="muted" style={{ fontSize: 13 }}>{fmt(h.amount)} held</span>
              </span>
              <span style={{ fontWeight: 600 }}>{h.usd != null ? `$${fmt(h.usd, 2)}` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. checkout */}
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="label">3 · Review and sign</span>

        {phase === 'idle' && (
          <button className="btn btn-primary" type="button" disabled={!canQuote} onClick={getQuote}>
            {connected ? 'Get price' : 'Connect a wallet to continue'}
          </button>
        )}
        {phase === 'quoting' && <span className="muted" role="status">Getting a price…</span>}

        {phase === 'ready' && invoice?.demo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="notice notice-info">
              {product.name}, {invoice.faceValue} {invoice.currency}.{' '}
              {demoEstimate ? <>Roughly <strong>{fmt(demoEstimate)} {payToken.symbol}</strong> at today’s price, before swap fees.</> : 'A live price appears here once the shop is connected.'}
            </div>
            <div className="notice notice-warn">{invoice.message}</div>
            <button className="btn btn-ghost" type="button" onClick={resetCheckout}>Start over</button>
          </div>
        )}

        {phase === 'ready' && invoice && !invoice.demo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Gift card</span><span>{product.name} · {invoice.faceValue} {invoice.currency}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Card price</span><span>{invoice.usdcAmount} USDC</span></div>
            {!quote.direct && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">You pay at most</span><strong>{fmt(maxIn, 6)} {payToken?.symbol}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Price impact</span><span>{fmt(Number(quote.priceImpactPct) * 100, 2)}%</span></div>
              </>
            )}
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
              One transaction swaps your {payToken?.symbol} and pays the card directly. Plus a small Solana network fee. GIFTED never holds your funds.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="button" onClick={pay}>Sign and pay</button>
              <button className="btn btn-ghost" type="button" onClick={resetCheckout}>Cancel</button>
            </div>
          </div>
        )}

        {phase === 'signing' && <span className="muted" role="status">Approve the transaction in your wallet…</span>}
        {phase === 'waiting' && <span className="muted" role="status">Payment sent. Wrapping your gift card… this can take a minute or two.</span>}

        {phase === 'done' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="notice notice-ok">Your {result.name} card is ready.</div>
            {result.redemption.code && <div className="code-box">{result.redemption.code}</div>}
            {result.redemption.code && (
              <button className="btn btn-ghost" type="button" onClick={() => navigator.clipboard?.writeText(result.redemption.code)}>Copy code</button>
            )}
            {result.redemption.instructions && <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>{result.redemption.instructions}</p>}
            <button className="btn btn-primary" type="button" onClick={() => { resetCheckout(); setResult(null); }}>Spend another bag</button>
          </div>
        )}

        {error && <div className="notice notice-warn" role="alert">{error}</div>}
      </div>

      </>
      )}

      {cards.length > 0 && (
        <p className="muted" style={{ margin: 0, textAlign: 'center' }}>
          You have {cards.length} card{cards.length === 1 ? '' : 's'} saved on this device. <Link href="/cards">View my cards</Link>
        </p>
      )}
    </section>
  );
}
