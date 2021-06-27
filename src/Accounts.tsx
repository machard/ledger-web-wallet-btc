import { useContext } from "react";
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import client from "./client";
import { context, fetchAccounts } from "./providers/accounts";
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
  const { accounts } = useContext(context);

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
                <br />
                xpub: {account.xpub}
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
    </div>
  );
}

export default withStyles(styles)(Accounts);
