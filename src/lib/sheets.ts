import { google } from "googleapis";
import serviceAccount from "../../secret/service-account-credentials.json";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getSheetsObj() {
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: SCOPES,
  });
  await auth.authorize();
  google.options({ auth });
  return google.sheets({ version: "v4", auth });
}
