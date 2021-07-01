import { getAuth } from "./auth";
import { google } from "googleapis";

const config = require("../config/config.json");

let ONE_MINUTE = 60000;

async function main() {
  const auth = await getAuth();

  setInterval(async () => {}, ONE_MINUTE * 5);
}

main();
