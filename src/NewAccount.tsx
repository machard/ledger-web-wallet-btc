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
import wallet from "./wallet";
import networks from "./networks";
import derivationModes from "./derivationModes";
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
    network: "mainnet",
    derivationMode: ""
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
      !form.network
    ) {
      return;
    }

    let derivationMode = form.derivationMode;

    if (!derivationMode) {
      const type = form.path.split('/')[0].replace("'", "");
      // @ts-ignore
      derivationMode = derivationModes[type];
    }

    let network: "mainnet" | "testnet" = "mainnet";
    let explorerParams: any[] = ["https://explorers.api.vault.ledger.com/blockchain/v3/btc"]

    if (form.network === "praline") {
      network = "testnet";
      explorerParams = ["http://localhost:20000/blockchain/v3", true]
    }

    await client.request("devices", "requireApp", [{
      name: "Bitcoin"
    }]);

    let account;
    try {
      account = await wallet.generateAccount({
        index: form.index,
        path: form.path,
        network,
        explorerParams,
        explorer: "ledgerv3",
        storage: "mock",
        storageParams: [],
        derivationMode
      });
    } catch(e) {
      return alert(e);
    }

    try {
      addAccount(form.name, account);
    } catch(e) {
      return alert(e);
    }

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
            <MenuItem key={network} value={network} selected={network === form.network}>{network}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="derivationModelabel">Derivation mode to use to derive addresses from xpub</InputLabel>
        <Select
          labelId="derivationModelabel"
          id="derivationMode"
          value={form.derivationMode}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => onChange({
            target: {
              id: "derivationMode",
              value: event.target.value
            }
          })}
          displayEmpty
        >
          <MenuItem value={""} selected={"" === form.derivationMode}></MenuItem>
          {Object.values(derivationModes).map(derivationMode => (
            <MenuItem key={derivationMode} value={derivationMode} selected={derivationMode === form.derivationMode}>{derivationMode}</MenuItem>
          ))}
        </Select>
        <FormHelperText>If you leave blank it will be selected based on the path. Only useful to set it to recover mistakes.</FormHelperText>
      </FormControl>
      <Box m={2} />
      <Button variant="contained" color="primary" onClick={add}>
        Add
      </Button>
    </Paper>
  );
}

export default withStyles(styles)(NewAccount);
