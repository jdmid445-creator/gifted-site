export const metadata = { title: 'Terms' };

export default function Terms() {
  return (
    <section className="wrap" style={{ padding: '48px 20px', maxWidth: 760, lineHeight: 1.65 }}>
      <h1 style={{ font: '500 40px var(--display)', margin: '0 0 16px' }}>Terms &amp; limits</h1>
      <p className="muted">[DRAFT: have a lawyer review before launch.]</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>What GiftedSwaps is</h2>
      <p>GiftedSwaps is a website that helps you swap a token in your own wallet and pay for a gift card in one transaction. It never takes custody of your funds. You review and sign every transaction yourself.</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>Who fulfills gift cards</h2>
      <p>Gift cards are supplied and fulfilled by Bitrefill under its own terms. Card availability, country restrictions, refunds and redemption rules are set by Bitrefill and the brand.</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>Prices and swaps</h2>
      <p>Swaps are routed through Jupiter. The amount you pay includes the card price, swap fees, price impact and Solana network fees, all shown before you sign. Prices can move between the quote and the transaction; the quote shows the most you can pay.</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>Private checkout</h2>
      <p>Private checkout routes your payment through NEAR Intents, a third-party network with its own terms and screening. GiftedSwaps never holds your funds in either mode. Privacy features are for protecting your financial privacy; using GiftedSwaps to launder money, evade sanctions or commit fraud is prohibited, and the network and the shop may refuse or refund payments they flag.</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>Your gift card code</h2>
      <p>Your code is shown on this site after payment confirms and saved in this browser. Treat it like cash: anyone with the code can spend it.</p>

      <h2 style={{ font: '500 22px var(--display)', letterSpacing: '-0.02em' }}>The $GIFTED token</h2>
      <p>$GIFTED is a meme coin. It has no promised value, returns, rights, or utility beyond being a community token. Holding $GIFTED is not required to use the shop.</p>
    </section>
  );
}
