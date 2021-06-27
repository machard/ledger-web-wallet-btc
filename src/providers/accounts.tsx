import React from 'react';
import { useEffect, useState } from 'react';
import client from "../client";

export let fetchAccounts: () => Promise<void>;

interface State {
  accounts: any[];
};

const initialState: State = {
  accounts: [],
};

export const context = React.createContext<State>(initialState);

function AccountsProvider({ children }: { children: any }) {
  const [accounts, setAccounts] = useState<any[]>([]);

  fetchAccounts = async () => {
    const accounts: any[] = await client.request("accounts", "list", [{ owner: "ledger-web-wallet-btc" }])
    setAccounts(accounts);
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  return <context.Provider value={{
    accounts
  }}>{children}</context.Provider>;
}

export default AccountsProvider;
