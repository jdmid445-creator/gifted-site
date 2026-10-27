import Link from 'next/link';

export const metadata = { title: 'Docs', description: 'How gifted works: standard and private checkout, fees, supported tokens and safety.' };

const toc = [
  ['overview', 'Overview'],
  ['quick-start', 'Quick start'],
  ['standard', 'Standard checkout'],
  ['private', 'Private checkout'],
  ['fees', 'Fees'],
  ['supported', 'Supported tokens & chains'],
  ['safety', 'Safety & custody'],
  ['cards', 'Your cards'],
  ['live', 'Live orders'],
  ['token', 'The $GIFTED token'],
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
          <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>Docs / gifted</div>
          <h1 style={{ font: '600 44px/1.05 var(--display)', letterSpacing: '-0.035em', margin: '0 0 12px' }}>How gifted works</h1>
          <p className="muted" style={{ fontSize: 18, marginTop: 0 }}>Swap any token into a gift card in one step, with an optional private checkout.</p>

          <h2 id="overview">Overview</h2>
          <p>gifted turns crypto into gift cards for thousands of brands. You pick a card, pick what to pay with, and approve one payment. Behind the scenes, three networks do the work:</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Piece</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td><strong>Bitrefill</strong></td><td>Sells and delivers the gift card.</td></tr>
                <tr><td><strong>Jupiter</strong></td><td>Swaps your token into the exact USDC the card costs (standard checkout).</td></tr>
                <tr><td><strong>NEAR Intents</strong></td><td>Pays for the card on its confidential network (private checkout).</td></tr>
              </tbody>
            </table>
          </div>
          <p>gifted itself is a website. It never holds your funds or your keys.</p>

          <h2 id="quick-start">Quick start</h2>
          <ol>
            <li>Open the <Link href="/#shop">shop</Link> and pick a brand and amount.</li>
            <li>Choose a token. You’ll see a live estimate before connecting anything.</li>
            <li>Choose <strong>Standard</strong> (connect a Solana wallet and sign once) or <strong>Private</strong> (send to a one-time deposit address from any wallet).</li>
            <li>Your code appears on screen when the card is delivered, and it’s saved under <Link href="/cards">My cards</Link>.</li>
          </ol>

          <h2 id="standard">Standard checkout</h2>
          <p>Standard checkout is one Solana transaction that does two things at once: swaps your token through Jupiter and sends the exact USDC amount straight to the gift card order.</p>
          <ul>
            <li>Pay with any token in your wallet that Jupiter can route.</li>
            <li>The exact price, including swap costs and price impact, is shown before you sign. The quote shows the most you can pay.</li>
            <li>Because it’s an ordinary Solana transaction, it’s public and verifiable on Solscan.</li>
          </ul>

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
          <div className="callout">Private, not invisible. Private checkout protects your financial privacy; it isn’t a way around the law. NEAR Intents screens deposits, and using gifted for laundering or fraud is prohibited.</div>
          <h3>Refunds</h3>
          <p>If a swap can’t complete, NEAR refunds your deposit to the refund address on the chain you paid from. If a card can’t be delivered, Bitrefill refunds to the Solana address you gave as the card refund address.</p>

          <h2 id="fees">Fees</h2>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Fee</th><th>Who charges it</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>gifted fee</td><td>gifted</td><td>None. gifted adds nothing.</td></tr>
                <tr><td>Card price</td><td>Bitrefill</td><td>Usually the face value, sometimes with a small spread.</td></tr>
                <tr><td>Swap</td><td>Jupiter / NEAR solvers</td><td>Shown in your quote before you pay.</td></tr>
                <tr><td>Network</td><td>The blockchain</td><td>A fraction of a cent on Solana.</td></tr>
              </tbody>
            </table>
          </div>

          <h2 id="supported">Supported tokens & chains</h2>
          <p><strong>Standard:</strong> any Solana token with a Jupiter route, including SOL, USDC and most memecoins.</p>
          <p><strong>Private:</strong> supported assets on Solana, Ethereum, Base, Arbitrum, BNB Chain, Bitcoin, Litecoin and Dogecoin. The list updates live from NEAR Intents.</p>
          <p><strong>Gift cards:</strong> thousands of brands. Each card shows the country it works in; check it before you buy.</p>

          <h2 id="safety">Safety & custody</h2>
          <ul>
            <li><strong>Non-custodial.</strong> Funds go from your wallet directly to Bitrefill or NEAR. gifted never holds them.</li>
            <li><strong>Server-side pricing.</strong> Card prices come from Bitrefill’s catalog on the server, never from your browser.</li>
            <li><strong>Codes stay yours.</strong> A code is only returned to the session that paid, using a signed access token.</li>
            <li><strong>No accounts.</strong> No sign-up, email or KYC on gifted itself.</li>
          </ul>

          <h2 id="cards">Your cards</h2>
          <p>Every card you buy is saved in your browser under <Link href="/cards">My cards</Link>, where you can reveal the code again. Codes aren’t stored on gifted’s servers, so clearing your browser data removes them. Treat codes like cash.</p>

          <h2 id="live">Live orders</h2>
          <p>The live feed on the homepage lists real, delivered orders. Standard orders link to their transaction on Solscan. Private orders show only the card and a rounded time, never a wallet, token or transaction.</p>

          <h2 id="token">The $GIFTED token</h2>
          <p>$GIFTED is the meme coin behind the shop, launched on pump.fun. It has no promised value, returns or rights, and you don’t need it to use gifted. The contract address is always in the site header.</p>

          <h2 id="faq">FAQ</h2>
          <h3>Do I need to connect a wallet?</h3>
          <p>Not to browse or see prices. Standard checkout needs a Solana wallet to sign. Private checkout works from any wallet by sending to the deposit address.</p>
          <h3>How long does delivery take?</h3>
          <p>Usually under a minute after your payment confirms. Private orders take a little longer while the network settles.</p>
          <h3>What if something goes wrong?</h3>
          <p>Failed swaps are refunded to your refund address, and undelivered cards are refunded by Bitrefill. Your order stays under My cards so you can check its status.</p>
        </article>
      </div>
    </section>
  );
}
