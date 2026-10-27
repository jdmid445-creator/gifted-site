// The $GIFTED creature peeking out of its gift box.
// `variant="full"` is the hero illustration; `variant="icon"` is the head-and-rim mark
// used in the header, favicon and token icon.
import { useId } from 'react';

export default function Mascot({ size = 320, variant = 'full', title = 'The $GIFTED creature peeking out of a gift box' }) {
  const raw = useId().replace(/:/g, '');
  const id = (k) => `${raw}${k}`;
  const label = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

  const defs = (
    <defs>
      <radialGradient id={id('body')} cx="38%" cy="28%" r="78%">
        <stop offset="0%" stopColor="#FFC6D5" />
        <stop offset="55%" stopColor="#FF6F98" />
        <stop offset="100%" stopColor="#A92A58" />
      </radialGradient>
      <linearGradient id={id('box')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A2150" />
        <stop offset="100%" stopColor="#170C22" />
      </linearGradient>
      <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#55327A" />
        <stop offset="100%" stopColor="#2C1840" />
      </linearGradient>
      <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFEBB0" />
        <stop offset="50%" stopColor="#F5B843" />
        <stop offset="100%" stopColor="#B97A12" />
      </linearGradient>
      <filter id={id('blur')} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </defs>
  );

  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 400 400" {...label}>
        {defs}
        <clipPath id={id('above')}><rect x="0" y="0" width="400" height="280" /></clipPath>
        <g clipPath={`url(#${id('above')})`}>
          <ellipse cx="112" cy="166" rx="34" ry="44" fill={`url(#${id('body')})`} transform="rotate(-24 112 166)" />
          <ellipse cx="288" cy="166" rx="34" ry="44" fill={`url(#${id('body')})`} transform="rotate(24 288 166)" />
          <ellipse cx="200" cy="300" rx="136" ry="150" fill={`url(#${id('body')})`} />
          <ellipse cx="155" cy="244" rx="15" ry="21" fill="#FFE08A" />
          <ellipse cx="245" cy="244" rx="15" ry="21" fill="#FFE08A" />
        </g>
        <path d="M262 122 C236 86 204 98 218 120 C226 134 248 132 262 122 Z M262 122 C288 86 320 98 306 120 C298 134 276 132 262 122 Z" fill={`url(#${id('gold')})`} transform="rotate(20 262 122)" />
        <rect x="20" y="272" width="360" height="110" rx="22" fill={`url(#${id('rim')})`} />
        <rect x="184" y="272" width="32" height="110" fill={`url(#${id('gold')})`} />
      </svg>
    );
  }

  const body = `url(#${id('body')})`;
  const gold = `url(#${id('gold')})`;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" {...label}>
      {defs}
      <clipPath id={id('above')}><rect x="0" y="0" width="400" height="262" /></clipPath>
      <ellipse cx="200" cy="378" rx="124" ry="10" fill="#000" opacity="0.55" />
      <g transform="rotate(18 330 250)">
        <rect x="262" y="234" width="126" height="34" rx="11" fill={`url(#${id('rim')})`} />
        <rect x="313" y="234" width="22" height="34" fill={gold} />
      </g>
      <rect x="92" y="244" width="216" height="30" rx="14" fill="#12081C" />
      <g clipPath={`url(#${id('above')})`}>
        <ellipse cx="136" cy="172" rx="24" ry="31" fill={body} transform="rotate(-24 136 172)" />
        <ellipse cx="138" cy="175" rx="11" ry="17" fill="#FFD9E4" opacity="0.75" transform="rotate(-24 138 175)" />
        <ellipse cx="264" cy="172" rx="24" ry="31" fill={body} transform="rotate(24 264 172)" />
        <ellipse cx="262" cy="175" rx="11" ry="17" fill="#FFD9E4" opacity="0.75" transform="rotate(24 262 175)" />
        <ellipse cx="200" cy="264" rx="96" ry="106" fill={body} />
        <ellipse cx="168" cy="226" rx="15" ry="19" fill="#FFE08A" opacity="0.65" filter={`url(#${id('blur')})`} />
        <ellipse cx="232" cy="226" rx="15" ry="19" fill="#FFE08A" opacity="0.65" filter={`url(#${id('blur')})`} />
        <ellipse cx="168" cy="226" rx="10" ry="14" fill="#FFE08A" />
        <ellipse cx="232" cy="226" rx="10" ry="14" fill="#FFE08A" />
        <circle cx="171" cy="220" r="3.5" fill="#FFFFFF" />
        <circle cx="235" cy="220" r="3.5" fill="#FFFFFF" />
        <ellipse cx="200" cy="247" rx="6" ry="4" fill="#7E1A40" />
        <ellipse cx="146" cy="252" rx="14" ry="7" fill="#FFA3BE" opacity="0.5" />
        <ellipse cx="254" cy="252" rx="14" ry="7" fill="#FFA3BE" opacity="0.5" />
      </g>
      <g transform="rotate(20 250 150)">
        <path d="M250 150 C232 124 210 132 220 148 C226 158 240 156 250 150 Z" fill={gold} />
        <path d="M250 150 C268 124 290 132 280 148 C274 158 260 156 250 150 Z" fill={gold} />
        <circle cx="250" cy="150" r="7" fill="#F5B843" />
      </g>
      <rect x="96" y="258" width="208" height="116" rx="18" fill={`url(#${id('box')})`} />
      <rect x="188" y="270" width="24" height="104" fill={gold} />
      <rect x="88" y="250" width="224" height="26" rx="13" fill={`url(#${id('rim')})`} />
      <rect x="186" y="250" width="28" height="26" fill={gold} />
      <ellipse cx="148" cy="252" rx="23" ry="14" fill={body} />
      <ellipse cx="252" cy="252" rx="23" ry="14" fill={body} />
      <path d="M141 258 v-6 M150 259 v-6 M159 258 v-6 M245 258 v-6 M254 259 v-6 M263 258 v-6" stroke="#A92A58" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M86 112 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#FFE08A" opacity="0.9" />
      <path d="M322 136 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}
