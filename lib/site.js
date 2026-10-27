// Everything you'd want to change before launch lives here or in .env.
export const site = {
  name: 'GIFTED',
  ticker: '$GIFTED',
  tagline: 'Your crypto, gift wrapped.',
  description: 'Turn any token into a gift card for hundreds of brands. Pay from Solana, Ethereum, Bitcoin and more, with an optional private checkout.',
  url: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://giftedswaps.com'),
  ca: process.env.NEXT_PUBLIC_GIFTED_CA || '',
  links: {
    x: process.env.NEXT_PUBLIC_X_URL || '',
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || '',
    pumpfun: process.env.NEXT_PUBLIC_GIFTED_CA ? `https://pump.fun/coin/${process.env.NEXT_PUBLIC_GIFTED_CA}` : '',
    dexscreener: process.env.NEXT_PUBLIC_GIFTED_CA ? `https://dexscreener.com/solana/${process.env.NEXT_PUBLIC_GIFTED_CA}` : '',
  },
};
