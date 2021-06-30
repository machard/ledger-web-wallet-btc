import Btc from "@ledgerhq/hw-app-btc";
import WalletLedger from "./ledger";
import { Account } from "../providers/accounts";

export interface Wallet {
  getXpub(btc: Btc, params: {
    path: string;
    index: string;
    // coininfo network
    network: any
  }): Promise<string>;
  send(
    btc: Btc,
    fromAccount: Account,
    dest: string,
    amount: number,
    fee: number,
  ): Promise<string>;
}

const wallets: {[key: string]: Wallet} = {
  "ledger": new WalletLedger(),
};

export default wallets;
