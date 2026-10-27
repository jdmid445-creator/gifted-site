// Chains you can pay from in private checkout.
// `key` matches the `blockchain` field in NEAR Intents' token list.
// `wallet: 'solana'` = one-click with a connected Solana wallet; `'deposit'` = send to the address shown.
export const CHAINS = [
  { key: 'sol', label: 'Solana', wallet: 'solana' },
  { key: 'eth', label: 'Ethereum', wallet: 'deposit' },
  { key: 'base', label: 'Base', wallet: 'deposit' },
  { key: 'arb', label: 'Arbitrum', wallet: 'deposit' },
  { key: 'bsc', label: 'BNB Chain', wallet: 'deposit' },
  { key: 'btc', label: 'Bitcoin', wallet: 'deposit' },
  { key: 'ltc', label: 'Litecoin', wallet: 'deposit' },
  { key: 'doge', label: 'Dogecoin', wallet: 'deposit' },
];

export const getChain = (key) => CHAINS.find((c) => c.key === key) || null;

const B58 = '[1-9A-HJ-NP-Za-km-z]';
const PATTERNS = {
  sol: new RegExp(`^${B58}{32,44}$`),
  eth: /^0x[a-fA-F0-9]{40}$/,
  base: /^0x[a-fA-F0-9]{40}$/,
  arb: /^0x[a-fA-F0-9]{40}$/,
  bsc: /^0x[a-fA-F0-9]{40}$/,
  btc: /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  ltc: /^(ltc1[a-z0-9]{25,87}|[LM3][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  doge: new RegExp(`^[DA9]${B58}{25,34}$`),
};

export function isValidAddress(chainKey, address) {
  const re = PATTERNS[chainKey];
  return Boolean(re && address && re.test(address.trim()));
}
