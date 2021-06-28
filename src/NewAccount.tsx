import React, { useReducer } from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import client from "./client";
import { FormControl, FormHelperText, MenuItem, Select } from '@material-ui/core';
import { InputLabel } from '@material-ui/core';
import btc from "./btc";
import wallets from "./wallets";
import networks from "./networks";
import { addAccount } from "./providers/accounts";

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
    wallettype: Object.keys(wallets)[0],
    network: "mainnet",
    format: ""
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

    const account = {
      ...form,
      // @ts-ignore
      path: form.path,
    }

    await client.request("devices", "requireApp", [{
      name: "Bitcoin"
    }]);

    let xpub;
    try {
      // @ts-ignore
      xpub = await wallets[form.wallettype].getXpub(btc, {
        index: form.index,
        path: form.path,
        format: form.format,
        // @ts-ignore
        network: networks[form.network]
      });
    } catch(e) {
      return alert(e);
    }

    account.xpub = xpub;
    account.owner = "ledger-web-wallet-btc";

    addAccount(account);

    dispatch({
      name: "",
      index: "",
      path: "",
    });

    alert("account added !");
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
          {Object.keys(wallets).map(wallet => (
            <MenuItem value={wallet} selected={wallet === form.wallettype}>{wallet}</MenuItem>
          ))}
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
          {Object.keys(networks).map(network => (
            <MenuItem value={network} selected={network === form.network}>{network}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="formatlabel">Format</InputLabel>
        <Select
          labelId="formatlabel"
          id="format"
          value={form.format}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => onChange({
            target: {
              id: "format",
              value: event.target.value
            }
          })}
          displayEmpty
        >
          <MenuItem value={""} selected={"" === form.format}></MenuItem>
          <MenuItem value={"p2sh"} selected={"p2sh" === form.format}>p2sh</MenuItem>
          <MenuItem value={"legacy"} selected={"legacy" === form.format}>legacy</MenuItem>
          <MenuItem value={"bech32"} selected={"bech32" === form.format}>bech32</MenuItem>
        </Select>
        <FormHelperText>Leave blank if unsure</FormHelperText>
      </FormControl>
      <Box m={2} />
      <Button variant="contained" color="primary" onClick={add}>
        Add
      </Button>
    </Paper>
  );
}

export default withStyles(styles)(NewAccount);
