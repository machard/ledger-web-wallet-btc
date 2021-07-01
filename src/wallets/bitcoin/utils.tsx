import * as bitcoin from "bitcoinjs-lib";
import bs58 from "bs58";
import { padStart } from "lodash";

export function parseHexString(str: any) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

export function encodeBase58Check(vchIn: any) {
  vchIn = parseHexString(vchIn);
  var chksum = bitcoin.crypto.sha256(vchIn);
  chksum = bitcoin.crypto.sha256(chksum);
  chksum = chksum.slice(0, 4);
  var hash = vchIn.concat(Array.from(chksum));
  return bs58.encode(hash);
}

export function toHexDigit(number: any) {
  var digits = "0123456789abcdef";
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f);
}

export function toHexInt(number: any) {
  return (
    toHexDigit((number >> 24) & 0xff) +
    toHexDigit((number >> 16) & 0xff) +
    toHexDigit((number >> 8) & 0xff) +
    toHexDigit(number & 0xff)
  );
}

export function compressPublicKey(publicKey: any) {
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


export function createXPUB(
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

