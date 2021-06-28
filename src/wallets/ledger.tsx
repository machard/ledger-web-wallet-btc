import * as bitcoin from "bitcoinjs-lib";
import Btc, { AddressFormat } from "@ledgerhq/hw-app-btc";
import bs58 from "bs58";
import { padStart } from "lodash";

function parseHexString(str: any) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function encodeBase58Check(vchIn: any) {
  vchIn = parseHexString(vchIn);
  var chksum = bitcoin.crypto.sha256(vchIn);
  chksum = bitcoin.crypto.sha256(chksum);
  chksum = chksum.slice(0, 4);
  var hash = vchIn.concat(Array.from(chksum));
  return bs58.encode(hash);
}

function toHexDigit(number: any) {
  var digits = "0123456789abcdef";
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f);
}

function toHexInt(number: any) {
  return (
    toHexDigit((number >> 24) & 0xff) +
    toHexDigit((number >> 16) & 0xff) +
    toHexDigit((number >> 8) & 0xff) +
    toHexDigit(number & 0xff)
  );
}

function compressPublicKey(publicKey: any) {
  var compressedKeyIndex;
  if (publicKey.substring(0, 2) !== "04") {
    throw "Invalid public key format";
  }
  if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
    compressedKeyIndex = "03";
  } else {
    compressedKeyIndex = "02";
  }
  var result = compressedKeyIndex + publicKey.substring(2, 66);
  return result;
}


function createXPUB(
  depth: any,
  fingerprint: any,
  childnum: any,
  chaincode: any,
  publicKey: any,
  network: any
) {
  var xpub = toHexInt(network);
  xpub = xpub + padStart(depth.toString(16), 2, "0");
  xpub = xpub + padStart(fingerprint.toString(16), 8, "0");
  xpub = xpub + padStart(childnum.toString(16), 8, "0");
  xpub = xpub + chaincode;
  xpub = xpub + publicKey;
  return xpub;
}

class WalletLedger {
  async getXpub(btc: Btc, params: {
      path: string;
      index: string;
      // coininfo network
      network: any
  }) {
    const parentDerivation = await btc.getWalletPublicKey(`${params.path}`);
    const accountDerivation = await btc.getWalletPublicKey(`${params.path}/${params.index}'`);
    
    // parent
    const publicKeyParentCompressed = compressPublicKey(parentDerivation.publicKey);
    const publicKeyParentCompressedHex = parseHexString(publicKeyParentCompressed);
    var result = bitcoin.crypto.sha256(Buffer.from(publicKeyParentCompressedHex));
    result = bitcoin.crypto.ripemd160(result);
    var fingerprint =
      ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>>
      0;

    // account
    const publicKeyAccountCompressed = compressPublicKey(accountDerivation.publicKey);
    var childnum = (0x80000000 | parseInt(params.index, 10)) >>> 0;

    console.log("netxork", params.network);

    var xpub = createXPUB(
      3,
      fingerprint,
      childnum,
      accountDerivation.chainCode,
      publicKeyAccountCompressed,
      params.network.bip32.public
    );

    return encodeBase58Check(xpub);
  }
}

export default WalletLedger;
