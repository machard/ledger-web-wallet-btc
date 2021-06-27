import React, { useReducer } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import client from "./client";
import btc from "./btc";
import wallets from "./wallets";
import NewAccount from "./NewAccount";

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

export interface AccountsProps extends WithStyles<typeof styles> {}

function Accounts(props: AccountsProps) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <NewAccount />
    </div>
  );
}

export default withStyles(styles)(Accounts);
