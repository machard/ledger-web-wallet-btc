import LWHwTransport from "ledger-web-hw-transport";
import Btc from "@ledgerhq/hw-app-btc";
import client from "./client";

export default new Btc(new LWHwTransport(client));
