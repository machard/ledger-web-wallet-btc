/* @flow */
import React, { ReactNode } from "react";
import useReducerWithLocalStorage from "../hooks/useReducerWithLocalStorage";
import { uniqBy, filter } from "lodash";

interface Account {
  name: string;
  path: string;
  index: string;
  network: string;
  wallettype: string;
  owner: string;
  format: string;
  xpub: string;
}

interface State {
  installedAccounts: Account[];
};

// actions/methods
export let removeAccount: (account: Account) => void = () => {};
export let addAccount: (account: Account) => void = () => {};
export let list: (_filter: any) => Account[] = () => [];

// reducer
const reducer = (state: State, update: any) => {
  let installedAccounts;
  console.log("accounts reducer", update);
  switch(update.type) {
    case "addAccount":
      installedAccounts = uniqBy(
        state.installedAccounts.concat([update.account]),
        (account) => [
          account.path,
          account.index,
          account.network,
          account.format,
          account.wallettype,
          account.owner
        ].join()
      );
      state = {
        ...state,
        installedAccounts,
      };
      break
    case "removeAccount":
      installedAccounts = state.installedAccounts.filter(account =>
        account.path !== update.account.path ||
        account.index !== update.account.index ||
        account.network !== update.account.network ||
        account.format !== update.account.format ||
        account.wallettype !== update.account.wallettype ||
        account.owner !== update.account.owner
      );

      state = {
        ...state,
        installedAccounts,
      };
      break
  }
  return state;
};
const initialState: State = {
  installedAccounts: [],
};

export const context = React.createContext<State>(initialState);

const AccountsProvider = ({
  children,
}: {
  children: ReactNode,
}) => {
  const [state, dispatch] = useReducerWithLocalStorage("accounts", reducer, initialState);

  removeAccount = (account: Account) => dispatch({
    type: "removeAccount",
    account,
  });;
  addAccount = (account: Account) => dispatch({
    type: "addAccount",
    account,
  });
  // @ts-ignore
  list = (_filter: any) => filter(state.installedAccounts, _filter);

  return <context.Provider value={state}>{children}</context.Provider>;
};

export default AccountsProvider;
