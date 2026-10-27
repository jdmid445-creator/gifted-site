// Fresh wallets made entirely in the browser. Keys are never sent anywhere.
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { bytesToHex, hexToBytes, concatBytes } from '@noble/hashes/utils.js';
import { bech32, base58check } from '@scure/base';

const b58c = base58check(sha256);
const hash160 = (b) => ripemd160(sha256(b));

export function newSolanaWallet() {
  const kp = Keypair.generate();
  return { address: kp.publicKey.toBase58(), secret: bs58.encode(kp.secretKey) };
}

// ---- EVM (Ethereum, Base, Arbitrum, BNB, Polygon, Avalanche: one key, one address)
function checksum(addrHex) {
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(addrHex)));
  return '0x' + [...addrHex].map((c, i) => (parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c)).join('');
}
function evmRaw(sk) {
  return keccak_256(secp256k1.getPublicKey(sk, false).slice(1)).slice(-20);
}
export function evmAddressFromKey(skHex) {
  return checksum(bytesToHex(evmRaw(hexToBytes(skHex.replace(/^0x/, '')))));
}
export function newEvmWallet() {
  const sk = secp256k1.utils.randomSecretKey();
  return { address: checksum(bytesToHex(evmRaw(sk))), secret: '0x' + bytesToHex(sk) };
}

// ---- Bitcoin-family (compressed keys, WIF private keys)
function wif(sk, prefix) {
  return b58c.encode(concatBytes(new Uint8Array([prefix]), sk, new Uint8Array([1])));
}
function segwit(hrp, sk) {
  const prog = hash160(secp256k1.getPublicKey(sk, true));
  return bech32.encode(hrp, [0, ...bech32.toWords(prog)]);
}
function legacy(version, sk) {
  return b58c.encode(concatBytes(new Uint8Array([version]), hash160(secp256k1.getPublicKey(sk, true))));
}
export function btcFromKey(sk) { return { address: segwit('bc', sk), secret: wif(sk, 0x80) }; }
export function ltcFromKey(sk) { return { address: segwit('ltc', sk), secret: wif(sk, 0xb0) }; }
export function dogeFromKey(sk) { return { address: legacy(0x1e, sk), secret: wif(sk, 0x9e) }; }
export const newBitcoinWallet = () => btcFromKey(secp256k1.utils.randomSecretKey());
export const newLitecoinWallet = () => ltcFromKey(secp256k1.utils.randomSecretKey());
export const newDogecoinWallet = () => dogeFromKey(secp256k1.utils.randomSecretKey());

// ---- Tron (base58check of 0x41 + the EVM-style address)
export function tronFromKey(sk) {
  return { address: b58c.encode(concatBytes(new Uint8Array([0x41]), evmRaw(sk))), secret: bytesToHex(sk) };
}
export const newTronWallet = () => tronFromKey(secp256k1.utils.randomSecretKey());
