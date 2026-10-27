export const metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <section className="wrap" style={{ padding: '56px 20px', maxWidth: 760, lineHeight: 1.7 }}>
      <h1 style={{ font: '600 44px var(--display)', letterSpacing: '-0.03em', margin: '0 0 16px' }}>Privacy</h1>
      <p className="muted">[DRAFT: have a lawyer review before launch.]</p>

      <h2 style={{ font: '600 22px var(--display)' }}>No accounts</h2>
      <p>gifted has no sign-up. We don’t ask for your name, email or phone number.</p>

      <h2 style={{ font: '600 22px var(--display)' }}>What we see</h2>
      <p>To create an order, your wallet’s public address is sent to the gift card provider (Bitrefill) as the refund address, along with the card you picked. Swap quotes are requested from Jupiter. Public blockchain data is, by nature, public.</p>

      <h2 style={{ font: '600 22px var(--display)' }}>Private checkout</h2>
      <p>In private checkout, the gift card is paid by the NEAR Intents network instead of your wallet, using its confidential mode. That removes the on-chain link between your wallet and the shop’s payment. It does not make you invisible: your deposit into the network is public on your chain, amount and timing can sometimes be correlated, the shop receives the refund address you give it, and a card is tied to the account you redeem it on. NEAR Intents screens deposits under its own policies.</p>

      <h2 style={{ font: '600 22px var(--display)' }}>What we keep</h2>
      <p>gifted does not store your orders on its servers. Your gift card codes are saved only in your own browser so you can find them again. Clearing your browser data removes them.</p>

      <h2 style={{ font: '600 22px var(--display)' }}>Third parties</h2>
      <p>Bitrefill, Jupiter and your Solana RPC provider each handle data under their own privacy policies.</p>
    </section>
  );
}
