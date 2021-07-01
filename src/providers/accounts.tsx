/* @flow */
import React, { ReactNode } from "react";
import useReducerWithLocalStorage from "../hooks/useReducerWithLocalStorage";
import { uniqBy, find } from "lodash";
import {
  Account as WalletAccount,
  SerializedAccount as WalletSerializedAccount
} from "wallets.js/dist/ledger";
// @ts-ignore
import wallet from "../wallet";

export interface Account {
  name: string,
  walletAccount: WalletAccount;
  syncing: boolean;
  balance: number | null;
  lastSync: string | null;
}
export interface SerializedAccount {
  name: string,
  walletAccount: WalletSerializedAccount;
  syncing: boolean;
  balance: number | null;
  lastSync: string | null;
}

interface State {
  installedAccounts: Account[];
};

// actions/methods
export let removeAccount: (walletAccount: WalletAccount) => void = () => {};
export let addAccount: (name: string, walletAccount: WalletAccount) => void = () => {};
export let syncAccount: (walletAccount: WalletAccount) => void = () => {};

export const makeId = (account: WalletAccount) => {
  return [
    account.params.path,
    account.params.index,
    account.params.network,
    account.params.derivationMode,
  ].join("-")
}

// reducer
const reducer = (state: State, update: any) => {
  let installedAccounts;
  console.log("accounts reducer", update);
  switch(update.type) {
    case "init":
      return update.state;
    case "addAccount":
      installedAccounts = uniqBy(
        state.installedAccounts.concat([{
          walletAccount: update.walletAccount,
          syncing: false,
          balance: null,
          lastSync: null,
          name: update.name,
        }]),
        (account) => makeId(account.walletAccount)
      );
      state = {
        ...state,
        installedAccounts,
      };
      break
    case "removeAccount":
      installedAccounts = state.installedAccounts.filter(account =>
        makeId(account.walletAccount) !== makeId(update.walletAccount)
      );

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
          if (makeId(account.walletAccount) !== makeId(update.walletAccount)) {
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

const accountskey = "accounts5";

const AccountsProvider = ({
  children,
}: {
  children: ReactNode,
}) => {
  const [state, dispatch] = useReducerWithLocalStorage(
    accountskey,
    reducer,
    initialState,
    {
      onsave: async (state: State) => {
        const serializedIAccounts = await Promise.all(
          state.installedAccounts.map(account => (async () => {
            const walletAccount = await wallet.exportToSerializedAccount(account.walletAccount);
            return {
              ...account,
              walletAccount
            }
          })())
        )
        return {
          ...state,
          installedAccounts: serializedIAccounts,
        }
      },
      onload: async (data: any) => {
        const installedAccounts = await Promise.all(
          data.installedAccounts.map((account: SerializedAccount) => (async () => {
            const walletAccount = await wallet.importFromSerializedAccount(account.walletAccount);
            return ({
              ...account,
              walletAccount
            })
          })())
        )
        return {
          ...state,
          installedAccounts,
        }
      }
    }
  );

  syncAccount = async (walletAccount: WalletAccount ) => {
    dispatch({
      type: "syncing",
      value: true,
      walletAccount,
    });
    let fail, balance;
    try {
      await wallet.syncAccount(walletAccount);
      balance = await wallet.getAccountBalance(walletAccount);
    } catch(e) {
      console.log("sync fail", walletAccount, e);
      fail = true;
    }
    dispatch({
      type: "syncing",
      value: false,
      walletAccount,
      balance,
      fail
    });
  }

  removeAccount = (walletAccount: WalletAccount) => {
    dispatch({
      type: "removeAccount",
      walletAccount,
    });
  }
  addAccount = (name: string, walletAccount: WalletAccount) => {
    const hasAccount = find(state.installedAccounts, iAccount =>
      makeId(iAccount.walletAccount) === makeId(walletAccount)
    );
    if (hasAccount) {
      throw new Error("This account already exists");
    }
    dispatch({
      type: "addAccount",
      walletAccount,
      name,
    });
  };

  return <context.Provider value={state}>{children}</context.Provider>;
};

export default AccountsProvider;
