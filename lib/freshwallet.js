// Fresh wallets made entirely in the browser. Keys are never sent anywhere.
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

export function newSolanaWallet() {
  const kp = Keypair.generate();
  return { address: kp.publicKey.toBase58(), secret: bs58.encode(kp.secretKey) };
}

// EIP-55 mixed-case checksum
function checksum(addrHex) {
  const hash = bytesToHex(keccak_256(new TextEncoder().encode(addrHex)));
  return '0x' + [...addrHex].map((c, i) => (parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c)).join('');
}

export function evmAddressFromKey(skHex) {
  const pub = secp256k1.getPublicKey(hexToBytes(skHex.replace(/^0x/, '')), false);
  return checksum(bytesToHex(keccak_256(pub.slice(1)).slice(-20)));
}

export function newEvmWallet() {
  const sk = bytesToHex(secp256k1.utils.randomSecretKey());
  return { address: evmAddressFromKey(sk), secret: '0x' + sk };
}
