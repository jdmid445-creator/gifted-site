'use client';

// The card you're buying, shown at the top of the checkout column.
import CardThumb from './CardThumb';

export default function OrderSummary({ product, faceValue, rows = [] }) {
  const usd = product?.currency === 'USD';
  return (
    <div className="panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {product ? <CardThumb key={product.id} name={product.name} image={product.image} domain={product.domain} width={52} /> : <span className="skeleton" style={{ width: 52, height: 33, borderRadius: 7, flex: 'none' }} />}
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product ? product.name.replace(/\s*\(.*\)$/, '') : 'Pick a gift card'}</strong>
          <span className="muted" style={{ fontSize: 13 }}>{product && faceValue ? `${usd ? '$' : ''}${faceValue}${usd ? '' : ` ${product.currency}`} gift card` : 'Choose an amount'}</span>
        </span>
      </div>
      {rows.length > 0 && <div style={{ height: 1, background: 'var(--line-strong)' }} />}
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="muted">{k}</span><span style={{ textAlign: 'right' }}>{v}</span></div>
      ))}
    </div>
  );
}
