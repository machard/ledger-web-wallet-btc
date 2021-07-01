import React, { useReducer, useContext } from 'react';
import Paper from '@material-ui/core/Paper';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { Box, Button, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@material-ui/core';
import { context, makeId } from './providers/accounts';
import wallet from "./wallet";

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      padding: theme.spacing(3, 3)
    },
    formControl: {
      marginTop: theme.spacing(2)
    },
  });

export interface AccountsProps extends WithStyles<typeof styles> {}

function Accounts(props: AccountsProps) {
  const { classes } = props;
  const [form, dispatch] = useReducer((state: any, u: any) => ({...state, ...u}), {});
  const { installedAccounts } = useContext(context);
  
  const onChange = (event: { target: { id: string; value: string; }; }) =>
    dispatch({
      [event.target.id]: event.target.value,
    });

  const fromAccount = installedAccounts.find(account =>
    makeId(account.walletAccount) === form.from
  );
  const toAccount = installedAccounts.find(account =>
    makeId(account.walletAccount) === form.to
  );

  const send = async() => {
    if (
      !form.from ||
      !form.to ||
      !form.amount ||
      !form.fee
    ) {
      return;
    }

    let dest: string = form.to;
    if (form.totype === "account") {
      if (!toAccount) {
        return alert("to account inexsitant");
      }
      dest = (await wallet.getAccountNewChangeAddress(toAccount.walletAccount)).address;
    }

    if (!fromAccount) {
      return alert("from account inexsitant");
    }

    let tx: string;
    try {
      tx = await wallet.buildAccountTx(
        fromAccount.walletAccount,
        dest,
        parseInt(form.amount, 10),
        parseInt(form.fee, 10)
      );
    } catch(e) {
      console.log(e);
      return alert("build tx error" + JSON.stringify(e));
    }

    try {
      const res = await wallet.broadcastTx(fromAccount.walletAccount, tx);

      alert("tx sent" + res);
    } catch(e) {
      return alert("send error" + JSON.stringify(e));
    }
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6">
        Send a transaction
      </Typography>
      <Divider light />
      <Box m={1} />
      <TextField
        id="amount"
        label="Amount in sats"
        required
        value={form.amount || ""}
        onChange={onChange}
      />
      <TextField
        id="fee"
        label="Fee in sats"
        required
        value={form.fee || ""}
        onChange={onChange}
      />
      <FormControl className={classes.formControl}>
        <InputLabel id="from-label">Send from</InputLabel>
        <Select
          labelId="from-label"
          id="from"
          value={form.from}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => onChange({
            target: {
              id: "from",
              value: event.target.value
            }
          })}
        >
          {installedAccounts
            .filter(account => account.balance && account.balance > 0)
            .map(account => (
              <MenuItem
                value={makeId(account.walletAccount)}
              >
                {account.name} ({ account.balance } sats, {account.walletAccount.params.network}, {account.walletAccount.params.explorerParams[0]})
              </MenuItem>
            ))
          }
        </Select>
        <FormHelperText>Shows synced accounts with a positive balance</FormHelperText>
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">To</FormLabel>
        <RadioGroup
          aria-label="totype"
          name="totype"
          value={form.totype}
          // @ts-ignore
          onChange={(event: { target: { value: string; }; }) => {
            onChange({
              target: {
                id: "totype",
                value: event.target.value
              }
            })
            onChange({
              target: {
                id: "to",
                value: "",
              }
            })
          }}
        >
          <FormControlLabel value="account" control={<Radio />} label="Account" />
          <FormControlLabel value="address" control={<Radio />} label="Address" />
        </RadioGroup>
      </FormControl>
      {form.totype === "account"  && fromAccount ? (
        <FormControl className={classes.formControl}>
          <InputLabel id="to-label">
            Send Destination account ({fromAccount.walletAccount.params.network}, {fromAccount.walletAccount.params.explorerParams[0]})
          </InputLabel>
          <Select
            labelId="to-label"
            id="to"
            value={form.to}
            // @ts-ignore
            onChange={(event: { target: { value: string; }; }) => onChange({
              target: {
                id: "to",
                value: event.target.value
              }
            })}
          >
            {installedAccounts
              .filter(account =>
                account.walletAccount.params.network === fromAccount.walletAccount.params.network &&
                account.walletAccount.params.explorerParams[0] === fromAccount.walletAccount.params.explorerParams[0]
              )
              .map(account => (
                <MenuItem value={makeId(account.walletAccount)}>
                  {account.name} ({ account.balance } sats)
                </MenuItem>
              ))
            }
          </Select>
          <FormHelperText>Shows synced accounts of the same network regardless of balance</FormHelperText>
        </FormControl>
      ) : (form.totype === "address" && fromAccount) ? (
        <TextField
          id="to"
          label="To Address"
          required
          value={form.to || ""}
          onChange={onChange}
        />
      ) : null}
      <Box m={2} />
      <Button
        variant="contained"
        color="primary"
        onClick={send}
      >
        Send
      </Button>
    </Paper>
  );
}

export default withStyles(styles)(Accounts);
