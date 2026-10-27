// Everything you'd want to change before launch lives here or in .env.
export const site = {
  name: 'GIFTED',
  ticker: '$GIFTED',
  tagline: 'Your bags, gift wrapped.',
  description: 'Turn any Solana token into a gift card for thousands of brands. One signature. Never custodial.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ca: process.env.NEXT_PUBLIC_GIFTED_CA || '',
  links: {
    x: process.env.NEXT_PUBLIC_X_URL || '',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
    pumpfun: process.env.NEXT_PUBLIC_GIFTED_CA ? `https://pump.fun/coin/${process.env.NEXT_PUBLIC_GIFTED_CA}` : '',
    dexscreener: process.env.NEXT_PUBLIC_GIFTED_CA ? `https://dexscreener.com/solana/${process.env.NEXT_PUBLIC_GIFTED_CA}` : '',
  },
};
