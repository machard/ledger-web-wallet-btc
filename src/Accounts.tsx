import React, { useEffect, useReducer, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import client from "./client";
import btc from "./btc";
import wallets from "./wallets";
import NewAccount from "./NewAccount";
import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column"
    },
    accounts: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      flexDirection: "row",
      marginBottom: theme.spacing(3)
    },
    card: {
      minWidth: 275,
      margin: theme.spacing(3, 3)
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });

export interface AccountsProps extends WithStyles<typeof styles> {}

function Accounts(props: AccountsProps) {
  const { classes } = props;
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchAccounts = async () => {
    const accounts: any[] = await client.request("accounts", "list", [{ owner: "ledger-web-wallet-btc" }])
    setAccounts(accounts);
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  console.log("Accounts accounts", accounts);

  return (
    <div className={classes.root}>
      <div className={classes.accounts}>
        {accounts.map((account, i) =>
          <Card key={i} className={classes.card} variant="outlined">
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                {account.name}
              </Typography>
              <Typography variant="h5" component="h2">
                Balance (soon)
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                path: {account.path}
              </Typography>
              <Typography variant="body2" component="p">
                network: {account.network}
                <br />
                wallettype: {account.wallettype}
                <br />
                index: {account.index}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">Sync (soon)</Button>
              <Button
                color="secondary"
                size="small"
                onClick={async () => {
                  await client.request("accounts", "removeAccount", [account]);
                  fetchAccounts();
                }}
              >Remove</Button>
            </CardActions>
          </Card>
        )}
      </div>
      <NewAccount fetchAccounts={fetchAccounts} />
    </div>
  );
}

export default withStyles(styles)(Accounts);
