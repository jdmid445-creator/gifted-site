// Bitrefill's redeem instructions arrive as text with line breaks or simple HTML.
// Keep each step on its own line instead of letting them run together.
export default function RedeemSteps({ text, size = 14 }) {
  if (!text) return null;
  const lines = String(text)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return <p className="muted" style={{ margin: 0, fontSize: size, lineHeight: 1.6 }}>{lines[0]}</p>;
  const [first, ...rest] = /:$/.test(lines[0]) ? lines : [null, ...lines];
  return (
    <div className="muted" style={{ fontSize: size, lineHeight: 1.6 }}>
      {first && <p style={{ margin: '0 0 4px' }}>{first}</p>}
      <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rest.map((l, i) => <li key={i}>{l}</li>)}
      </ol>
    </div>
  );
}
