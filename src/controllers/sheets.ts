import { google, sheets_v4 } from "googleapis";

import serviceAccount from "../../secret/service-account-credentials.json";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getSheetsObj() {
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: SCOPES,
  });
  await auth.authorize();
  google.options({auth});
  return google.sheets({ version: "v4", auth });
}

export async function getArray(
  sheetsObj: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  return (await new Promise((resolve, reject) => {
    sheetsObj.spreadsheets.values.get(
      { spreadsheetId, range },
      (err: any, res: any) => {
        err ? reject(err) : resolve(res.data.values);
      }
    );
  })) as any[][];
}

export async function getObjectArray(
  sheetsObj: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[]> {
  return toObjectArray(await getArray(sheetsObj, spreadsheetId, range));
}

function toObjectArray(array: any[][]): any[] {
  const header = array.splice(0, 1)[0];
  const output = [] as any[];

  array.forEach((el) => {
    const entry = {} as any;
    header.forEach((h, i) => {
      entry[h] = el[i] ? el[i] : undefined;
    });
    output.push(entry);
  });

  return output;
}
