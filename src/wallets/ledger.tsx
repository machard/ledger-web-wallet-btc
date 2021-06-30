import * as bitcoin from "bitcoinjs-lib";
import Btc from "@ledgerhq/hw-app-btc";
// @ts-ignore
import { BufferWriter } from "bitcoinjs-lib/src/bufferutils";
import { Account } from "../providers/accounts";
import { Transaction } from "@ledgerhq/hw-app-btc/lib/types";
import { Wallet } from "./index";
import * as utils from "./utils";

class WalletLedger implements Wallet {
  async getXpub(btc: Btc, params: {
      path: string;
      index: string;
      // coininfo network
      network: any
  }) {
    const parentDerivation = await btc.getWalletPublicKey(`${params.path}`);
    const accountDerivation = await btc.getWalletPublicKey(`${params.path}/${params.index}'`);
    
    // parent
    const publicKeyParentCompressed = utils.compressPublicKey(parentDerivation.publicKey);
    const publicKeyParentCompressedHex = utils.parseHexString(publicKeyParentCompressed);
    var result = bitcoin.crypto.sha256(Buffer.from(publicKeyParentCompressedHex));
    result = bitcoin.crypto.ripemd160(result);
    var fingerprint =
      ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>>
      0;

    // account
    const publicKeyAccountCompressed = utils.compressPublicKey(accountDerivation.publicKey);
    var childnum = (0x80000000 | parseInt(params.index, 10)) >>> 0;

    console.log("netxork", params.network);

    var xpub = utils.createXPUB(
      3,
      fingerprint,
      childnum,
      accountDerivation.chainCode,
      publicKeyAccountCompressed,
      params.network.bip32.public
    );

    return utils.encodeBase58Check(xpub);
  }

  async send(btc: Btc, fromAccount: Account, dest: string, amount: number, fee: number) {
    
    const changeAddress = await fromAccount.xpubobj.getNewAddress(1, 1);
    let txinfos;
    txinfos = await fromAccount.xpubobj.buildTx(
      dest,
      amount,
      fee,
      changeAddress
    );
    
    const length = txinfos.outputs.reduce((sum, output) => {
      return sum + 8 + output.script.length + 1;
    }, 1)
    const buffer = Buffer.allocUnsafe(length);
    const bufferWriter = new BufferWriter(
      buffer,
      0,
    );
    bufferWriter.writeVarInt(txinfos.outputs.length);
    txinfos.outputs.forEach(txOut => {
      bufferWriter.writeUInt64(txOut.value);
      bufferWriter.writeVarSlice(txOut.script);
    });
    const outputScriptHex = buffer.toString("hex");

    // @ts-ignore fromAccount is defined
    const associatedKeysets = txinfos.associatedDerivations.map(
      ([account, index]) =>
      `${fromAccount.path}/${fromAccount.index}'/${account}/${index}`
    );
    type Inputs = [Transaction, number, string | null | undefined, number | null | undefined][];
    const inputs: Inputs =txinfos.inputs.map(([txHex, index]) => ([
      btc.splitTransaction(txHex, true), index, null, null
    ]));

    console.log("call hw-app-btc", {
      // @ts-ignore
      inputs,
      associatedKeysets,
      outputScriptHex
    });

    const tx = await btc.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      additionals: []
    });

    return tx;
  }
}

export default WalletLedger;
