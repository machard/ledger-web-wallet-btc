import React, { useReducer } from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import client from "./client";
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import btc from "./btc";
import wallets from "./wallets";
import { fetchAccounts } from "./providers/accounts";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    paper: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      padding: theme.spacing(3, 3)
    },
    formControl: {
      marginTop: theme.spacing(2)
    },
  });

export interface NewAccountProps extends WithStyles<typeof styles> {}

function NewAccount(props: NewAccountProps) {
  const { classes } = props;
  const [form, dispatch] = useReducer((state: any, u: any) => ({...state, ...u}), {
    wallettype: "bip32",
    network: "mainnet"
  })
  
  const onChange = (event: { target: { id: string; value: string; }; }) =>
    dispatch({
      [event.target.id]: event.target.value,
    });

  const add = async() => {
    if (
      !form.name ||
      !form.path ||
      !form.index ||
      form.index < 0 ||
      !form.wallettype ||
      !form.network
    ) {
      return;
    }

    if (form.wallettype === "ledger") {
      return alert("Ledger base derivation not supported yet");
    }

    const account = {
      ...form,
      // @ts-ignore
      path: form.path,
    }

    await client.request("devices", "requireApp", [{
      name: "Bitcoin"
    }]);

    let accountDerivation;
    try {
      accountDerivation = await btc.getWalletPublicKey(`${form.path}/${form.index}’`);
    } catch(e) {
      return alert(e);
    }

    console.log("account derivation", accountDerivation);
    
    // @ts-ignore
    const xpub = wallets[form.wallettype].getXpub(accountDerivation);

    account.xpub = xpub;
    account.owner = "ledger-web-wallet-btc";

    await client.request("accounts", "addAccount", [account]);

    fetchAccounts();

    dispatch({
      name: "",
      derivationMode: "Legacy",
      index: ""
    });
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6">
        Add a new Bitcoin account
      </Typography>
      <Divider light />
      <Box m={1} />
      <TextField
        id="name"
        label="Name"
        required
        value={form.name || ""}
        onChange={onChange}
      />
      <TextField
        id="path"
        label="Base path"
        required
        value={form.path || ""}
        onChange={onChange}
        helperText="ex: 84'/0'"
      />
      <TextField
        id="index"
        type="number"
        label="index"
        helperText="an account number, from 0"
        value={form.index || ""}
        onChange={onChange}
        required
      />
      <FormControl className={classes.formControl}>
        <InputLabel id="wallettypelabel">Base derivation method</InputLabel>
        <Select
          labelId="wallettypelabel"
          id="wallettype"
          value={form.wallettype}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => onChange({
            target: {
              id: "wallettype",
              value: event.target.value
            }
          })}
          displayEmpty
        >
          <MenuItem value={"bip32"} selected={"bip32" === form.wallettype}>bip32</MenuItem>
          <MenuItem value={"ledger"} selected={"ledger" === form.wallettype}>ledger</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="networklabel">Network</InputLabel>
        <Select
          labelId="networklabel"
          id="network"
          value={form.network}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => onChange({
            target: {
              id: "network",
              value: event.target.value
            }
          })}
          displayEmpty
        >
          <MenuItem value={"mainnet"} selected={"mainnet" === form.network}>mainnet</MenuItem>
          <MenuItem value={"pralinelocal"} selected={"pralinelocal" === form.network}>pralinelocal</MenuItem>
        </Select>
      </FormControl>
      <Box m={2} />
      <Button variant="contained" color="primary" onClick={add}>
        Add
      </Button>
    </Paper>
  );
}

export default withStyles(styles)(NewAccount);
