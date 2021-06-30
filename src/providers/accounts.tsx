/* @flow */
import React, { ReactNode } from "react";
import useReducerWithLocalStorage from "../hooks/useReducerWithLocalStorage";
import { uniqBy, filter, omit, find } from "lodash";
import Xpub from "xpub.js/dist/xpub";
import LedgerV3Dot2Dot4 from "xpub.js/dist/explorer/ledger.v3.2.4";
import Bitcoin from "xpub.js/dist/crypto/bitcoin";
import Mock from "xpub.js/dist/storage/mock";
// @ts-ignore
import coininfo from "coininfo";

export interface Account {
  name: string;
  path: string;
  index: string;
  network: string;
  wallettype: string;
  owner: string;
  derivationMode: string;
  xpub: string;
  id: string;
  xpubobj: Xpub;
  syncing: boolean;
  balance: number;
  lastSync: string;
}

interface State {
  installedAccounts: Account[];
};

// actions/methods
export let removeAccount: (id: string) => void = () => {};
export let addAccount: (account: Account) => void = () => {};
export let syncAccount: (id: string) => void = () => {};
export let list: (_filter: any) => Account[] = () => [];

const getxpubobj = (account: any) => {
  let network = coininfo.bitcoin.main.toBitcoinJS();
  let explorer = new LedgerV3Dot2Dot4({
    explorerURI: "https://explorers.api.vault.ledger.com/blockchain/v3/btc",
  });

  if (account.network === "praline") {
    network = coininfo.bitcoin.test.toBitcoinJS();
    explorer = new LedgerV3Dot2Dot4({
      explorerURI: "http://localhost:20000/blockchain/v3",
      disableBatchSize: true, // https://ledgerhq.atlassian.net/browse/BACK-2191
    });
  }

  const crypto = new Bitcoin({
    network,
  });
  const storage = new Mock();

  return new Xpub({
    storage,
    explorer,
    crypto,
    xpub: account.xpub,
    derivationMode: account.derivationMode,
  })
}

const makeId = (account: any) => {
  return [
    account.path,
    account.index,
    account.network,
    account.derivationMode,
    account.wallettype,
    account.owner
  ].join("-")
}

// reducer
const reducer = (state: State, update: any) => {
  let installedAccounts;
  console.log("accounts reducer", update);
  switch(update.type) {
    case "addAccount":
      installedAccounts = uniqBy(
        state.installedAccounts.concat([{
          ...update.account,
          xpubobj: getxpubobj(update.account),
          id: makeId(update.account)
        }]),
        "id"
      );
      state = {
        ...state,
        installedAccounts,
      };
      break
    case "removeAccount":
      installedAccounts = state.installedAccounts.filter(account => account.id !== update.id);

      state = {
        ...state,
        installedAccounts,
      };
      break
    case "syncing":
      // better to use something like immutable.js
      state = {
        ...state,
        installedAccounts: state.installedAccounts.map(account => {
          if (account.id !== update.id) {
            return account;
          }
          if (update.value) {
            return {
              ...account,
              syncing: true
            }
          }
          if (update.fail) {
            return {
              ...account,
              syncing: false
            }
          }
          return {
            ...account,
            syncing: false,
            balance: update.balance,
            lastSync: new Date().toISOString()
          }
        }),
      };
      break
  }
  return state;
};
const initialState: State = {
  installedAccounts: [],
};

export const context = React.createContext<State>(initialState);

const txskey = (id: string) => `account.${id}.txs`;

const AccountsProvider = ({
  children,
}: {
  children: ReactNode,
}) => {
  const [state, dispatch] = useReducerWithLocalStorage(
    "accounts3",
    reducer,
    initialState,
    {
      onsave: (state: State) => {
        return {
          ...state,
          installedAccounts: state.installedAccounts.map(account =>
            omit(account, "xpubobj")
          ),
        }
      },
      onload: (data: any) => {
        return {
          ...data,
          installedAccounts: data.installedAccounts.map((account: any) => {
            const xpubobj = getxpubobj(account);
            
            try {
              const txs = localStorage.getItem(txskey(account.id)) || "[]";
              xpubobj.storage.load(JSON.parse(txs));
            } catch(e) {}
            
            return ({
              ...account,
              xpubobj
            })
          }),
        }
      }
    }
  );

  syncAccount = async (id: string ) => {
    const account: Account = find(state.installedAccounts, account => account.id === id);
    dispatch({
      type: "syncing",
      value: true,
      id,
    });
    let fail, balance;
    try {
      await account.xpubobj.sync();
      balance = await account.xpubobj.getXpubBalance();
      const txs = await account.xpubobj.storage.export();
      localStorage.setItem(txskey(account.id), JSON.stringify(txs));
    } catch(e) {
      console.log("sync fail", id, e);
      fail = true;
    }
    dispatch({
      type: "syncing",
      value: false,
      id,
      balance,
      fail
    });
  }

  removeAccount = (id: string) => {
    dispatch({
      type: "removeAccount",
      id,
    });
    localStorage.removeItem(txskey(id))
  }
  addAccount = (account: any) => {
    dispatch({
      type: "addAccount",
      account,
    });
  };
  // @ts-ignore
  list = (_filter: any) => filter(state.installedAccounts, _filter);

  return <context.Provider value={state}>{children}</context.Provider>;
};

export default AccountsProvider;
