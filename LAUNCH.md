# gifted launch checklist

## Site map
| Page | What it is |
|---|---|
| `/` | Landing: hero, brands, how it works, why gifted, $GIFTED token + CA, FAQ, final CTA |
| `/spend` | The app: pick card + amount, then **Standard** (one signature from your Solana wallet via Jupiter) or **Private** (paid by NEAR Intents' confidential network from Solana, Ethereum, Base, Arbitrum, BNB, Bitcoin, Litecoin or Dogecoin) |
| `/cards` | My cards: every card bought on this device, tap to reveal the code again |
| `/terms`, `/privacy` | Drafts (lawyer review before launch) |
| 404 | Branded "Nothing in this box" page |
| Share image, favicon, app icon | `public/og.png`, `app/icon.svg`, `app/apple-icon.png` |

## What the owner provides
1. **Bitrefill API key** (bitrefill.com → Account → Developers) for testing. Apply at bitrefill.com/partner for launch.
2. **Jupiter API key** (Jupiter developer portal).
3. **Private Solana RPC URL** (Helius / QuickNode / Triton).
4. **Domain** and where it's hosted (Vercel recommended).
5. **Contract address** after the pump.fun launch, plus X and Telegram links.
6. **NEAR Intents key** (`NEAR_INTENTS_JWT`): the same partner key Parallax uses works.
7. **GIFTED_SECRET**: any 32+ random characters (or let us generate one).

## Before going live
- [ ] Put the values above in Vercel's environment variables (see `.env.example`).
- [ ] Test buy with Bitrefill test products (`BITREFILL_TEST_PRODUCTS=true`).
- [ ] One small real purchase end to end (pay with SOL, then with a memecoin).
- [ ] One small **private** purchase from Solana and one from another chain (e.g. Base).
- [ ] Tell Bitrefill about private checkout in the partner application and confirm it's allowed.
- [ ] Turn test products off.
- [ ] Lawyer review of `/terms` and `/privacy`.
- [ ] Add the CA to `NEXT_PUBLIC_GIFTED_CA` the moment the coin is live.

## Already handled
- Prices always come from the server catalog, never the browser.
- Gift codes only returned with a signed access token.
- Rate limits on invoice creation and swap endpoints.
- Non-custodial: USDC goes straight from the swap to Bitrefill's invoice address.
- Demo mode runs safely until credentials are added.

## Live orders feed (Upstash Redis)
The homepage "Live orders" feed shows only orders Bitrefill confirms as delivered. Nothing is ever faked.
1. Vercel → your project → Storage → Create → Upstash (Redis), free plan → connect it to this project (all environments).
2. That adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.
3. Redeploy.
Private-checkout orders appear with no token, no tx and a rounded time, so they can't be matched to a wallet.
