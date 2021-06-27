import * as bip32 from "bip32";
import * as bitcoin from "bitcoinjs-lib";

class WalletBip32 {
  getXpub(accountDerivation: {
    publicKey: string;
    bitcoinAddress: string;
    chainCode: string;
}) {
    const pubkeyBuf = Buffer.from(accountDerivation.publicKey, 'hex')
    const pubkey = bitcoin.ECPair.fromPublicKey(pubkeyBuf)

    const xpub = bip32.fromPublicKey(
      pubkey.publicKey,
      Buffer.from(accountDerivation.chainCode, "hex"),
    );

    return xpub.toBase58();
  }
}

export default WalletBip32;
