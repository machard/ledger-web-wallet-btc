import { useContext } from "react";
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { context, removeAccount, syncAccount, Account } from "./providers/accounts";
import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';
import wallet from "./wallet";

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
  const { installedAccounts } = useContext(context);

  const copyNewAddressInClipboard = async (account: Account) => {
    const { address } = await wallet.getAccountNewReceiveAddress(account.walletAccount);
    navigator.clipboard.writeText(address);
  }

  return (
    <div className={classes.root}>
      <div className={classes.accounts}>
        {installedAccounts.map((account, i) =>
          <Card key={i} className={classes.card} variant="outlined">
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                {account.name}
              </Typography>
              <Typography variant="h5" component="h2">
                {account.balance !== undefined ?
                  `${account.balance} sats`
                : "Not synced"}
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                path: {account.walletAccount.params.path}
              </Typography>
              <Typography variant="body2" component="p">
                network: {account.walletAccount.params.network}
                <br />
                networkbis: {account.walletAccount.params.explorerParams[0]}
                <br />
                index: {account.walletAccount.params.index}
                <br />
                derivationMode: {account.walletAccount.params.derivationMode}
                <br />
                xpub: {account.walletAccount.xpub.xpub}
                <br />
                lastSync: {account.lastSync}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                disabled={account.syncing}
                onClick={async () => {
                  syncAccount(account.walletAccount);
                }}
              >Sync{account.syncing ? "ing...": ""}</Button>
              <Button
                size="small"
                disabled={account.syncing}
                onClick={async () => {
                  copyNewAddressInClipboard(account);
                }}
              >Copy new address in clipboard{account.syncing ? "ing...": ""}</Button>
              <Button
                color="secondary"
                size="small"
                onClick={async () => {
                  removeAccount(account.walletAccount);
                }}
              >Remove</Button>
            </CardActions>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withStyles(styles)(Accounts);
