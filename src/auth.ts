import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { Credentials, OAuth2Client } from "google-auth-library";

import { credentialsObject } from "./types";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"];

const CREDETIALS_PATH = path.join(__dirname, "../config/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../config/token.json");

export async function getAuth(): Promise<OAuth2Client> {
  return new Promise((resolve, reject) => {
    function returnAuth(auth: OAuth2Client) {
      if (auth) resolve(auth);
      reject("No auth received");
    }

    fs.readFile(CREDETIALS_PATH, (err, content) => {
      if (err) {
        console.error("Couldn't load credentials.json file", err);
        reject("Couldn't load credentials.json file");
        return;
      }
      authorize(JSON.parse(content.toString()), returnAuth);
    });
  });
}

function authorize(credentials: credentialsObject, callback: Function) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client: OAuth2Client, callback: Function) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving acces token:", err);

      oAuth2Client.setCredentials(token as Credentials);

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
}
