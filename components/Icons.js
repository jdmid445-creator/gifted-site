// GiftedSwaps's own icon set: 24px grid, 1.75 stroke, rounded joins. Decorative by default.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconGift = (p) => (
  <svg {...base} {...p}><rect x="3.5" y="8.5" width="17" height="4" rx="1" /><path d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /><path d="M12 8.5v12" /><path d="M12 8.5c-1.5-3.5-5-4-5.5-2S9 8.5 12 8.5zM12 8.5c1.5-3.5 5-4 5.5-2S15 8.5 12 8.5z" /></svg>
);
export const IconSwap = (p) => (
  <svg {...base} {...p}><path d="M4 8h13l-3.5-3.5" /><path d="M20 16H7l3.5 3.5" /></svg>
);
export const IconShield = (p) => (
  <svg {...base} {...p}><path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IconEyeOff = (p) => (
  <svg {...base} {...p}><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.5 9 6-.3.8-1.2 2.3-2.7 3.6M6.6 7.6C4.6 8.9 3.4 10.9 3 12c.5 1.5 4 6 9 6 1.5 0 2.9-.4 4.1-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const IconBolt = (p) => (
  <svg {...base} {...p}><path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" /></svg>
);
export const IconWallet = (p) => (
  <svg {...base} {...p}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><rect x="4" y="8" width="16" height="11" rx="2" /><circle cx="16" cy="13.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);
export const IconCopy = (p) => (
  <svg {...base} {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconArrow = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconSearch = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const IconChain = (p) => (
  <svg {...base} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" /></svg>
);
// X (formerly Twitter) mark, filled, for the social link.
export const IconX = (p) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z" /></svg>
);
