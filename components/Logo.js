// The GiftedSwaps mark: a gift box seen from above, split by its ribbon, with a rose knot.
// The box takes the current text colour, so it works on dark and light backgrounds.
import { useId } from 'react';

export default function Logo({ size = 32, title = 'GiftedSwaps', style }) {
  const id = `gs${useId().replace(/:/g, '')}`;
  const label = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flex: 'none', ...style }} {...label}>
      <mask id={id}>
        <rect x="0" y="0" width="100" height="100" fill="#fff" />
        <rect x="45" y="0" width="10" height="100" fill="#000" />
        <rect x="0" y="45" width="100" height="10" fill="#000" />
      </mask>
      <rect x="8" y="8" width="84" height="84" rx="20" fill="currentColor" mask={`url(#${id})`} />
      <rect x="38" y="38" width="24" height="24" rx="5" fill="#F0517A" transform="rotate(45 50 50)" />
    </svg>
  );
}
