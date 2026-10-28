import Link from 'next/link';

export const metadata = { title: 'Docs', description: 'How GiftedSwaps works: private checkout, max privacy, fees, supported coins and safety.' };

const toc = [
  ['overview', 'Overview'],
  ['quick-start', 'Quick start'],
  ['private', 'Private checkout'],
  ['max', 'Max privacy'],
  ['fees', 'Fees'],
  ['supported', 'Supported tokens & chains'],
  ['safety', 'Safety & custody'],
  ['cards', 'Your cards'],
  ['live', 'Live orders'],
  ['token', 'The $GSWAP token'],
  ['faq', 'FAQ'],
];

export default function Docs() {
  return (
    <section className="wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="docs">
        <nav aria-label="Docs" className="docs-nav">
          <span className="label" style={{ padding: '0 10px 8px' }}>Documentation</span>
          {toc.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>

        <article className="docs-body">
          <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>Docs / GiftedSwaps</div>
          <h1 style={{ font: '500 44px/1.05 var(--display)', letterSpacing: '-0.035em', margin: '0 0 12px' }}>How GiftedSwaps works</h1>
          <p className="muted" style={{ fontSize: 18, marginTop: 0 }}>Turn any coin into a gift card without connecting a wallet.</p>

          <h2 id="overview">Overview</h2>
          <p>GiftedSwaps turns crypto into gift cards for thousands of brands. You pick a card, pick what to pay with, and send to a one-time address from any wallet. You never connect a wallet to the site. Behind the scenes, three networks do the work:</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Piece</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td><strong>Bitrefill</strong></td><td>Sells and delivers the gift card.</td></tr>
                <tr><td><strong>Houdini Swap</strong></td><td>Routes your coins through Monero into a one-time wallet (max privacy).</td></tr>
                <tr><td><strong>NEAR Intents</strong></td><td>Pays for the card on its confidential network (private checkout).</td></tr>
              </tbody>
            </table>
          </div>
          <p>GiftedSwaps itself is a website. It never holds your funds or your keys.</p>

          <h2 id="quick-start">Quick start</h2>
          <ol>
            <li>Open the <Link href="/#shop">shop</Link> and pick a brand and amount.</li>
            <li>Choose the chain and coin you’re paying with, and paste a refund address.</li>
            <li>Send the exact amount shown to the one-time deposit address, from any wallet. No connecting.</li>
            <li>Your code appears on screen when the card is delivered, and it’s saved under <Link href="/cards">My cards</Link>.</li>
          </ol>

          <h2 id="private">Private checkout</h2>
          <p>Private checkout pays the gift card through <strong>NEAR Intents</strong> using its confidential mode. You send funds to a one-time deposit address, and NEAR’s network pays the shop. On-chain, the shop’s payment comes from the network, not from your wallet.</p>
          <h3>What it hides</h3>
          <ul>
            <li>The on-chain link between your wallet and the gift card purchase.</li>
            <li>The route and settlement details, which run on NEAR’s confidential network.</li>
          </ul>
          <h3>What it doesn’t hide</h3>
          <ul>
            <li>Your deposit into the network is a normal, public transaction on your chain.</li>
            <li>Amount and timing can sometimes be matched by a determined observer.</li>
            <li>The shop receives the refund address you give it. Use a fresh wallet for more privacy.</li>
            <li>A gift card is tied to whatever account you redeem it on.</li>
          </ul>
          <div className="callout">Private, not invisible. Private checkout protects your financial privacy; it isn’t a way around the law. NEAR Intents screens deposits, and using GiftedSwaps for laundering or fraud is prohibited.</div>
          <h3>Refunds</h3>
          <p>If a swap can’t complete, NEAR refunds your deposit to the refund address on the chain you paid from. If a card can’t be delivered, Bitrefill refunds to the Solana address you gave as the card refund address.</p>

          <h2 id="max">Max privacy</h2>
          <p>Max privacy goes one step further. Your coins never touch NEAR or the shop directly. They go through Houdini Swap, which routes them through Monero, and come out as SOL in a brand-new wallet made in your browser just for this order. That wallet then buys the card on its own.</p>
          <ol>
            <li>Pick a card and any coin Houdini supports (BTC, ETH, SOL, XMR, USDT and many more).</li>
            <li>Save the backup key for your one-time wallet, then send the exact amount to the deposit address.</li>
            <li>Houdini swaps it through Monero (usually 15–45 minutes). Nothing on-chain links what you sent to what arrives.</li>
            <li>When the SOL lands, the page swaps it to USDC and pays for the card in one transaction, signed with the one-time key. Leftover SOL stays in that wallet, and you have its key.</li>
          </ol>
          <div className="callout">Houdini requires your IP address, browser and timezone for its own compliance screening, so we pass those through. We don’t store them. Houdini blocks sanctioned countries and may hold deposits linked to illicit activity.</div>
          <p>Keep the tab open until the card is delivered. If you close it, your SOL is safe in the one-time wallet: import the backup key into Phantom or Solflare to get it back.</p>

          <h2 id="fees">Fees</h2>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Fee</th><th>Who charges it</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>GiftedSwaps fee</td><td>GiftedSwaps</td><td>None. GiftedSwaps adds nothing.</td></tr>
                <tr><td>Card price</td><td>Bitrefill</td><td>Usually the face value, sometimes with a small spread.</td></tr>
                <tr><td>Swap</td><td>NEAR solvers / Houdini</td><td>Shown in your quote before you pay.</td></tr>
                <tr><td>Network</td><td>The blockchain</td><td>A fraction of a cent on Solana.</td></tr>
              </tbody>
            </table>
          </div>

          <h2 id="supported">Supported tokens & chains</h2>
          <p><strong>Max privacy:</strong> BTC, ETH, SOL, XMR, USDT, LTC, DOGE and many more, from Houdini Swap’s live list.</p>
          <p><strong>Private:</strong> supported assets on Solana, Ethereum, Base, Arbitrum, BNB Chain, Bitcoin, Litecoin and Dogecoin. The list updates live from NEAR Intents.</p>
          <p><strong>Gift cards:</strong> thousands of brands. Each card shows the country it works in; check it before you buy.</p>

          <h2 id="safety">Safety & custody</h2>
          <ul>
            <li><strong>Non-custodial.</strong> Funds go from your wallet to the payment network, which pays Bitrefill. GiftedSwaps never holds them, and you never connect a wallet to the site.</li>
            <li><strong>Server-side pricing.</strong> Card prices come from Bitrefill’s catalog on the server, never from your browser.</li>
            <li><strong>Codes stay yours.</strong> A code is only returned to the session that paid, using a signed access token.</li>
            <li><strong>No accounts.</strong> No sign-up, email or KYC on GiftedSwaps itself.</li>
          </ul>

          <h2 id="cards">Your cards</h2>
          <p>Every card you buy is saved in your browser under <Link href="/cards">My cards</Link>, where you can reveal the code again. Codes aren’t stored on GiftedSwaps’s servers, so clearing your browser data removes them. Treat codes like cash.</p>

          <h2 id="live">Live orders</h2>
          <p>The live feed on the homepage lists every paid order: the card, the amount and a rounded time. It never shows a wallet, coin or transaction.</p>

          <h2 id="token">The $GSWAP token</h2>
          <p>$GSWAP is the meme coin behind the shop, launched on pump.fun. It has no promised value, returns or rights, and you don’t need it to use GiftedSwaps. The contract address is always in the site header.</p>

          <h2 id="faq">FAQ</h2>
          <h3>Do I need to connect a wallet?</h3>
          <p>No. You never connect a wallet. You send to a one-time deposit address from any wallet.</p>
          <h3>How long does delivery take?</h3>
          <p>About a minute after your deposit confirms with Private checkout, and 15 to 45 minutes with Max privacy.</p>
          <h3>What if something goes wrong?</h3>
          <p>Failed swaps are refunded to your refund address, and undelivered cards are refunded by Bitrefill. Your order stays under My cards so you can check its status.</p>
        </article>
      </div>
    </section>
  );
}
