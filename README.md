# $GIFTED: turn any bag into a gift card

Next.js site for the $GIFTED meme coin and its shop: pick a gift card, pick any
token in your Solana wallet, sign once. Jupiter swaps the token into the exact
USDC the card costs and sends it straight to Bitrefill's invoice in the same
transaction. GIFTED never holds anyone's funds.

## Pages
- `/` landing page
- `/spend` the shop (wallet connect, card search, token picker, checkout)
- `/terms` draft terms (get a lawyer to review)

## How a purchase works
1. Server looks the card up in Bitrefill's catalog (price never comes from the browser).
2. Server creates a Bitrefill invoice paid in `usdc_solana` and returns the pay-to
   address, the exact USDC amount, and a signed access token.
3. Browser asks Jupiter for an **ExactOut** quote: "how much of my token buys exactly this much USDC".
4. One transaction: create the invoice's USDC account if needed, then swap, with the
   USDC landing directly in that account. Paying in USDC skips the swap.
5. Browser polls the invoice; when it's complete it shows the code. Codes are only
   returned with the access token, and saved in the buyer's browser.

## Run it
```
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```
With no Bitrefill credentials the shop runs in **demo mode**: a sample catalog,
and checkout stops before payment.

## Environment
See `.env.example`. Required for real sales: `BITREFILL_API_KEY` (testing) or
`BITREFILL_API_ID` + `BITREFILL_API_SECRET` (launch), `JUPITER_API_KEY`,
`NEXT_PUBLIC_SOLANA_RPC`, `GIFTED_SECRET`.

## Before launch
- Test end to end with Bitrefill's test products (`BITREFILL_TEST_PRODUCTS=true`).
- Confirm Jupiter's current API base URL and that ExactOut works for the tokens you care about.
- Use a private RPC.
- Add rate limiting on `/api/invoice` (each call creates a real invoice).
- Lawyer review of `/terms`.
