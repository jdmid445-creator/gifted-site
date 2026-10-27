'use client';

// The shop console: 1 pick a card · 2 pick what to pay with · 3 check out.
// Everything up to the final signature works without connecting a wallet.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { Buffer } from 'buffer';
import Link from 'next/link';
import PrivateCheckout from './PrivateCheckout';
import { loadCards, saveCards, statusUrl } from '@/lib/cards';
import CardThumb from './CardThumb';
import TokenIcon from './TokenIcon';
import RevealCode from './RevealCode';
import { CATEGORIES } from '@/lib/brands';
import { COUNTRIES } from '@/lib/countries';
import { site } from '@/lib/site';
import { IconSearch, IconBolt, IconEyeOff, IconWallet, IconCopy, IconCheck } from './Icons';

const USDC = 'EPjFWdd5AufqSSqeM2qy1xbybapC8G4wEGGkZwyTDt1v';
const SOL = 'So11111111111111111111111111111111111111112';

const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

// Always at the top of the list. The rest comes live from what's trading on Jupiter.
const BASE = [
  ...(site.ca ? [{ mint: site.ca, symbol: 'GIFTED' }] : []),
  { mint: SOL, symbol: 'SOL', decimals: 9 },
  { mint: USDC, symbol: 'USDC', decimals: 6, usdPrice: 1 },
  { mint: USDT, symbol: 'USDT', decimals: 6, usdPrice: 1 },
  { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK' },
  { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF' },
];
const POPULAR = BASE;

// Start on a sensible amount (around $25-50), not the biggest one.
const defaultPkg = (p) => (p.packages.find((k) => k.value >= 25) || p.packages[0])?.id || null;
const cleanName = (n = '') => n.replace(/\s*\(.*\)$/, '');

const short = (s) => (s ? `${s.slice(0, 4)}…${s.slice(-4)}` : '');
function fmt(n, d) {
  if (!Number.isFinite(n)) return '—';
  const digits = d ?? (n >= 1000 ? 0 : n >= 1 ? 2 : 6);
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

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

function StepHead({ n, title, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, font: '500 17px var(--display)', letterSpacing: '-0.015em' }}>
        <span className="step-num">{String(n).padStart(2, '0')}</span>{title}
      </span>
      {hint && <span className="label">{hint}</span>}
    </div>
  );
}



export default function Shop() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [mode, setMode] = useState('private');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Popular');
  const [country, setCountry] = useState('US');
  const [products, setProducts] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [product, setProduct] = useState(null);
  const [pkgId, setPkgId] = useState(null);
  const [customValue, setCustomValue] = useState('');

  const [popular, setPopular] = useState(POPULAR);
  const [holdings, setHoldings] = useState([]);
  const [payMint, setPayMint] = useState(SOL);
  const [tokenQuery, setTokenQuery] = useState('');
  const [tokenResults, setTokenResults] = useState(null);
  const [picked, setPicked] = useState(null); // a token chosen from search

  const [invoice, setInvoice] = useState(null);
  const [quote, setQuote] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | quoting | ready | signing | waiting | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Catalog
  // Empty query -> load the current category shelf; otherwise search.
  const catRef = useRef('Popular');
  const reqId = useRef(0);
  const [loadError, setLoadError] = useState('');
  const search = useCallback(async (q) => {
    const id = ++reqId.current;
    setLoadingProducts(true);
    setLoadError('');
    const url = q
      ? `/api/products?q=${encodeURIComponent(q)}&country=${countryRef.current}`
      : `/api/products?shelf=${encodeURIComponent(catRef.current)}&country=${countryRef.current}`;
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Couldn’t load gift cards.');
      if (id !== reqId.current) return;
      setProducts(data.products || []);
      setDemo(Boolean(data.demo));
    } catch (e) {
      if (id === reqId.current) { setProducts([]); setLoadError(e.message || 'Couldn’t load gift cards.'); }
    } finally {
      if (id === reqId.current) setLoadingProducts(false);
    }
  }, []);
  const countryRef = useRef('US');
  useEffect(() => {
    let saved = 'US';
    try { saved = localStorage.getItem('gifted.country') || 'US'; } catch {}
    countryRef.current = saved;
    setCountry(saved);
    search('');
  }, [search]);
  function changeCountry(c) {
    countryRef.current = c;
    setCountry(c);
    try { localStorage.setItem('gifted.country', c); } catch {}
    setProduct(null);
    search(query.trim());
  }
  useEffect(() => {
    const q = query.trim();
    if (q.length === 1) return undefined;
    const t = setTimeout(() => search(q), 450);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!product && products.length) {
      setProduct(products[0]);
      setPkgId(defaultPkg(products[0]));
    }
  }, [products]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live prices for the popular list (no wallet needed)
  useEffect(() => {
    Promise.all([
      fetch(`/api/tokens?mints=${BASE.map((p) => p.mint).join(',')}`).then((r) => r.json()).catch(() => ({})),
      fetch('/api/tokens?list=top').then((r) => r.json()).catch(() => ({})),
    ]).then(([base, top]) => {
      const info = base.tokens || {};
      const head = BASE.map((p) => ({ ...p, ...(info[p.mint] || {}), symbol: p.symbol, mint: p.mint, decimals: info[p.mint]?.decimals ?? p.decimals, usdPrice: info[p.mint]?.usdPrice ?? p.usdPrice ?? null }));
      const seen = new Set(head.map((t) => t.mint));
      const rest = (top.tokens || []).filter((t) => !seen.has(t.mint)).slice(0, 40);
      setPopular([...head, ...rest]);
    });
  }, []);

  // Token search (by name, ticker or contract address)
  useEffect(() => {
    const q = tokenQuery.trim();
    if (!q) { setTokenResults(null); return undefined; }
    if (connected && holdings.length) {
      const n = q.toLowerCase();
      setTokenResults(holdings.filter((t) => t.symbol.toLowerCase().includes(n) || t.mint === q));
      return undefined;
    }
    const t = setTimeout(() => {
      fetch(`/api/tokens?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => setTokenResults(d.tokens || [])).catch(() => setTokenResults([]));
    }, 280);
    return () => clearTimeout(t);
  }, [tokenQuery, connected, holdings]);

  // Wallet holdings once connected
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
        const meta = (await fetch(`/api/tokens?mints=${list.map((h) => h.mint).slice(0, 50).join(',')}`).then((r) => r.json()).catch(() => ({}))).tokens || {};
        const rows = list.map((h) => {
          const m = meta[h.mint] || {};
          const symbol = h.mint === SOL ? 'SOL' : h.mint === USDC ? 'USDC' : m.symbol || short(h.mint);
          const usdPrice = m.usdPrice ?? (h.mint === USDC ? 1 : null);
          return { ...h, symbol, icon: m.icon || null, usdPrice, usd: usdPrice != null ? h.amount * usdPrice : null };
        }).sort((x, y) => (y.usd ?? -1) - (x.usd ?? -1));
        if (!cancelled) {
          setHoldings(rows);
          if (!rows.find((r) => r.mint === payMint)) setPayMint(rows[0]?.mint || SOL);
        }
      } catch {
        if (!cancelled) setError('Couldn’t read your wallet right now. Try again in a moment.');
      }
    })();
    return () => { cancelled = true; };
  }, [publicKey, connection]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseList = connected && holdings.length ? holdings : popular;
  const tokens = tokenResults ?? baseList;
  const payToken = [picked, ...baseList, ...(tokenResults || [])].find((t) => t && t.mint === payMint) || baseList[0] || null;

  const faceValue = useMemo(() => {
    if (!product) return null;
    if (pkgId) return product.packages.find((p) => p.id === pkgId)?.value ?? null;
    const v = Number(customValue);
    return product.range && Number.isFinite(v) && v >= product.range.min && v <= product.range.max ? v : null;
  }, [product, pkgId, customValue]);

  const estimate = (t) => (faceValue && t?.usdPrice ? faceValue / t.usdPrice : null);
  const resetCheckout = () => { setInvoice(null); setQuote(null); setPhase('idle'); setError(''); };

  async function getQuote() {
    setError('');
    setPhase('quoting');
    try {
      const inv = await postJson('/api/invoice', { productId: product.id, packageId: pkgId || null, value: pkgId ? null : Number(customValue), wallet: publicKey.toBase58() });
      setInvoice(inv);
      if (inv.demo) { setQuote(null); setPhase('ready'); return; }
      if (payToken.mint === USDC) setQuote({ direct: true });
      else setQuote((await postJson('/api/jup/quote', { inputMint: payToken.mint, usdcAtomic: inv.usdcAtomic })).quote);
      setPhase('ready');
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  async function pay() {
    setError('');
    setPhase('signing');
    try {
      const user = publicKey;
      const payTo = new PublicKey(invoice.payTo);
      const usdcMint = new PublicKey(USDC);
      const destAta = getAssociatedTokenAddressSync(usdcMint, payTo, true);
      const createDest = createAssociatedTokenAccountIdempotentInstruction(user, destAta, payTo, usdcMint);
      let instructions;
      let lookupTables = [];
      if (quote.direct) {
        instructions = [createDest, createTransferCheckedInstruction(getAssociatedTokenAddressSync(usdcMint, user), usdcMint, destAta, user, BigInt(invoice.usdcAtomic), 6)];
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
        lookupTables = (await Promise.all((built.addressLookupTableAddresses || []).map((a) => connection.getAddressLookupTable(new PublicKey(a)).then((r) => r.value)))).filter(Boolean);
      }
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const tx = new VersionedTransaction(new TransactionMessage({ payerKey: user, recentBlockhash: blockhash, instructions }).compileToV0Message(lookupTables));
      const signature = await sendTransaction(tx, connection);
      setPhase('waiting');
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
      const entry = { id: invoice.id, token: invoice.accessToken, name: product.name, value: faceValue, currency: invoice.currency, signature, symbol: payToken.symbol, at: Date.now() };
      saveCards([entry, ...loadCards().filter((c) => c.id !== entry.id)]);
      pollInvoice(entry);
    } catch (e) {
      setError(/reject|denied|cancel/i.test(e.message || '') ? 'You cancelled in your wallet.' : e.message);
      setPhase('ready');
    }
  }

  async function pollInvoice(entry) {
    for (let i = 0; i < 150; i++) {
      try {
        const data = await fetch(statusUrl(entry)).then((r) => r.json());
        if (data.status === 'complete' && data.redemption) { setResult({ ...entry, redemption: data.redemption }); setPhase('done'); return; }
        if (['expired', 'failed', 'refunded'].includes(data.status)) { setError(`The order ${data.status}. If you paid, it’s refunded to your wallet.`); setPhase('idle'); return; }
      } catch {}
      await new Promise((r) => setTimeout(r, 4000));
    }
    setError('Still wrapping your card. It’s saved under My cards, so you can check back any time.');
    setPhase('idle');
  }

  const maxIn = quote && !quote.direct && payToken?.decimals != null ? Number(quote.otherAmountThreshold || quote.inAmount) / 10 ** payToken.decimals : null;

  // What the card grid shows: search results, or the shelf filtered by category.
  const shown = products;

  // ---------- render ----------
  const cardColumn = (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepHead n="1" title="Pick a gift card" hint={demo ? 'Sample catalog' : null} />
      <div style={{ display: 'flex', gap: 8 }}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); search(query); }} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <label htmlFor="brand-q" className="sr-only">Search brands</label>
        <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }}><IconSearch /></span>
        <input id="brand-q" className="input" style={{ paddingLeft: 44 }} placeholder="Search Nike, DoorDash, Chipotle…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>
      <label htmlFor="country" className="sr-only">Country</label>
      <select id="country" className="input" value={country} onChange={(e) => changeCountry(e.target.value)} style={{ width: 84, flex: 'none', paddingRight: 6 }} title="Where you'll use the card">
        {COUNTRIES.map(([code, name]) => <option key={code} value={code} title={name}>{code}</option>)}
      </select>
      </div>
      <div className="quick" role="group" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="quick-chip" aria-pressed={!query.trim() && cat === c}
            onClick={() => { setCat(c); catRef.current = c; setQuery(''); search(''); }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, maxHeight: 300, overflowY: 'auto', paddingBottom: 3 }}>
        {loadingProducts && Array.from({ length: 6 }, (_, i) => <span key={`sk${i}`} className="skeleton" style={{ height: 54 }} />)}
        {!loadingProducts && loadError && (
          <span style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 14 }} className="muted">
            {loadError}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => search(query.trim())}>Try again</button>
          </span>
        )}
        {!loadingProducts && !loadError && shown.length === 0 && <span className="muted" style={{ fontSize: 14, gridColumn: '1 / -1' }}>No cards found. Try another brand or country.</span>}
        {!loadingProducts && shown.map((p) => (
          <button key={p.id} type="button" className="pick" aria-pressed={product?.id === p.id} style={{ minHeight: 54 }}
            onClick={() => { setProduct(p); setPkgId(defaultPkg(p)); setCustomValue(''); resetCheckout(); }}>
            <CardThumb key={p.id} name={p.name} image={p.image} domain={p.domain} width={44} />
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanName(p.name)}</span>
              <span className="muted num" style={{ fontSize: 11.5 }}>{p.country || 'Global'}</span>
            </span>
          </button>
        ))}
      </div>
      {product && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="label">Amount · {product.currency}</span>
          {product.packages.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.packages.map((k) => (
                <button key={k.id} type="button" className="chip" aria-pressed={pkgId === k.id} onClick={() => { setPkgId(k.id); resetCheckout(); }}>{product.currency === 'USD' ? '$' : ''}{k.value.toLocaleString()}</button>
              ))}
            </div>
          ) : product.range ? (
            <>
              <label htmlFor="amt" className="muted" style={{ fontSize: 13 }}>Any amount from {product.range.min} to {product.range.max}</label>
              <input id="amt" className="input" inputMode="decimal" placeholder={String(product.range.min)} value={customValue} onChange={(e) => { setCustomValue(e.target.value); setPkgId(null); resetCheckout(); }} />
            </>
          ) : null}
        </div>
      )}
    </div>
  );

  const payColumn = (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepHead n="2" title="Pay with" hint={connected ? 'Your wallet' : 'Live prices'} />
      <div style={{ position: 'relative' }}>
        <label htmlFor="tok-q" className="sr-only">Search coins</label>
        <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }}><IconSearch /></span>
        <input id="tok-q" className="input" style={{ paddingLeft: 44 }} placeholder={connected ? 'Search your coins' : 'Search any coin or paste a contract'} value={tokenQuery} onChange={(e) => setTokenQuery(e.target.value)} spellCheck={false} autoComplete="off" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto', paddingBottom: 3 }}>
        {tokenResults && tokenResults.length === 0 && <span className="muted" style={{ fontSize: 14 }}>No coins found{connected ? ' in your wallet' : ''}.</span>}
        {tokens.map((t) => {
          const est = estimate(t);
          return (
            <button key={t.mint} type="button" className="pick" aria-pressed={payToken?.mint === t.mint} onClick={() => { setPicked(t); setPayMint(t.mint); resetCheckout(); }}>
              <TokenIcon mint={t.mint} icon={t.icon} symbol={t.symbol} />
              <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500 }}>{t.symbol}</span>
                <span className="muted num" style={{ fontSize: 11.5 }}>{t.amount != null ? `${fmt(t.amount)} held` : t.usdPrice ? `$${fmt(t.usdPrice)}` : 'Solana token'}</span>
              </span>
              <span className="num" style={{ textAlign: 'right', fontSize: 13 }}>
                {est ? <span key={fmt(est)} className="tick"><span className="dim">≈ </span>{fmt(est)}</span> : ''}
              </span>
            </button>
          );
        })}
      </div>
      {!connected && (
        <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
          Connect your wallet to see exactly what you hold.
        </p>
      )}
    </div>
  );

  const checkoutColumn = (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepHead n="3" title="Check out" />
      <div className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Card</span><strong style={{ textAlign: 'right', fontWeight: 500 }}>{product ? `${product.name.replace(/\s*\(.*\)$/, '')} · ${faceValue ?? '—'} ${product.currency}` : '—'}</strong></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">Pay with</span><strong style={{ fontWeight: 500 }}>{payToken?.symbol || '—'}</strong></div>
        <div style={{ height: 1, background: 'var(--line-strong)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
          <span className="muted">{phase === 'ready' && maxIn ? 'You pay at most' : 'Estimated'}</span>
          <strong className="num" style={{ fontSize: 21, fontWeight: 500 }}>
            <span key={`${phase}-${payToken?.mint}-${faceValue}`} className="tick">{phase === 'ready' && maxIn ? fmt(maxIn) : phase === 'ready' && quote?.direct ? invoice.usdcAmount : (estimate(payToken) ? `≈ ${fmt(estimate(payToken))}` : '—')}</span> <span className="muted" style={{ fontSize: 13 }}>{payToken?.symbol}</span>
          </strong>
        </div>
        {phase !== 'ready' && <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>At today’s price, before swap and network fees. You see the exact amount before you sign.</span>}
        {phase === 'ready' && invoice && !invoice.demo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, paddingTop: 4, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Card price</span><span className="num">{invoice.usdcAmount} USDC</span></div>
            {quote && !quote.direct && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Swap price impact</span><span className="num">{fmt(Number(quote.priceImpactPct) * 100, 2)}%</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">gifted fee</span><span className="num">$0</span></div>
          </div>
        )}
      </div>

      {phase === 'idle' && !connected && (
        <button className="btn btn-primary" type="button" onClick={() => setVisible(true)} disabled={!faceValue}>
          <IconWallet /> Connect wallet to buy
        </button>
      )}
      {phase === 'idle' && connected && (
        <button className="btn btn-primary" type="button" onClick={getQuote} disabled={!product || !faceValue || !payToken}>Get exact price</button>
      )}
      {phase === 'quoting' && <button className="btn btn-primary" type="button" disabled>Getting your price…</button>}

      {phase === 'ready' && invoice?.demo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="notice notice-info">{invoice.message}</div>
          <button className="btn btn-ghost" type="button" onClick={resetCheckout}>Start over</button>
        </div>
      )}
      {phase === 'ready' && invoice && !invoice.demo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary" type="button" onClick={pay}>Sign and pay</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={resetCheckout}>Cancel</button>
          <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>One transaction swaps your {payToken?.symbol} and pays the card directly. gifted never holds your funds.</span>
        </div>
      )}
      {phase === 'signing' && <button className="btn btn-primary" type="button" disabled>Approve in your wallet…</button>}
      {phase === 'waiting' && <div className="notice notice-info" role="status">Paid. Wrapping your gift card, usually under a minute…</div>}

      {phase === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="notice notice-ok">Your {result.name} card is ready.</div>
          <RevealCode code={result.redemption.code} />
          {result.redemption.instructions && <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{result.redemption.instructions}</p>}
          <button className="btn btn-primary" type="button" onClick={() => { resetCheckout(); setResult(null); }}>Buy another</button>
        </div>
      )}
      {error && <div className="notice notice-warn" role="alert">{error}</div>}
      <Link href="/cards" className="muted" style={{ fontSize: 13, textAlign: 'center' }}>My cards</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div className="mode-switch" role="group" aria-label="Checkout mode" style={{ width: 'min(100%, 360px)' }}>
          <button type="button" aria-pressed={mode === 'private'} onClick={() => { setMode('private'); resetCheckout(); }}><IconEyeOff width={17} height={17} /> Private</button>
          <button type="button" aria-pressed={mode === 'standard'} onClick={() => { setMode('standard'); resetCheckout(); }}><IconBolt width={17} height={17} /> Standard</button>
        </div>
        <span className="muted" style={{ fontSize: 14, flex: '1 1 280px', textAlign: 'right' }}>
          {mode === 'standard'
            ? 'One signature from your Solana wallet. Fastest, but the payment comes from your wallet.'
            : 'The shop never sees your wallet. Pay from any of 8 chains, no wallet connection needed.'}
        </span>
      </div>
      <div className="console">
        {cardColumn}
        {mode === 'standard' ? (
          <>
            {payColumn}
            {checkoutColumn}
          </>
        ) : (
          <PrivateCheckout product={product} pkgId={pkgId} customValue={customValue} faceValue={faceValue} />
        )}
      </div>
    </div>
  );
}
