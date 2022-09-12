import { GaxiosResponse } from "gaxios";
import { sheets_v4 } from "googleapis";
import _ from "lodash";
import { getUtilPrint, utilPrint } from "../utils/print.js";
import { Connection } from "./data-sources.js";
import { IFieldMapping, IntersectionFieldType } from "./enums.js";

export interface SheetsConnection extends Connection {
  spreadsheet: sheets_v4.Sheets;
  sheet: string; // sheet name
  headerRowIndex?: string; // row for the column names
}

export async function getArray(
  sheetsObj: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  return await new Promise((resolve, reject) => {
    if (!range) {
      throw new Error("Range is missing");
    }
    sheetsObj.spreadsheets.values.get(
      { spreadsheetId, range },
      (err: Error | null, res?: GaxiosResponse<any> | null) => {
        if (!res) {
          reject();
        } else {
          utilPrint(res.data.values);
          err ? reject(err) : resolve(res.data.values);
        }
      }
    );
  });
}

/* export async function getObjectArray(
  sheetsObj: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string
): Promise<any[]> {
  if (!range) {
    throw new Error("Range is missing")
  }
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
 */

export async function setHeaderRowUsingFieldMapping(
  fieldMapping: IFieldMapping[]
): Promise<string[]> {
  const headerValues: string[] = [];
  fieldMapping.forEach((mapping) => {
    headerValues.push(mapping.entryName);
  });
  return new Promise((resolve) => {
    resolve(headerValues);
  });
}

export async function updateSingleRangeRecord(
  data: any,
  sheetObj: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetId: string,
  range: string,
  isAppend = false
): Promise<{ updatedCells?: number | null; spreadsheetId?: string | null }> {
  let rangeWithSheet = range;
  if (sheetId) {
    rangeWithSheet = `${sheetId}${rangeWithSheet}`;
  }

  try {
    if (isAppend) {
      const result = await sheetObj.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED", //move to constant
        requestBody: { values: data },
      });
      const responseData = result.data;
      return new Promise((resolve) =>
        resolve({
          updatedCells: responseData.updates?.updatedCells,
          spreadsheetId: responseData.spreadsheetId,
        })
      );
    } else {
      const result = await sheetObj.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: data },
      });
      const responseData = result.data;
      return new Promise((resolve) =>
        resolve({
          updatedCells: responseData?.updatedCells,
          spreadsheetId: responseData.spreadsheetId,
        })
      );
    }
  } catch (err) {
    getUtilPrint({ err });
    throw err;
  }
}

export async function createSheetsValuesArray(
  fieldMapping: IFieldMapping[],
  record: Record<string, any>
) {
  const row: any[] = [];

  Object.entries(fieldMapping).forEach(([entry, fieldMappingValue]) => {
    const key = fieldMappingValue.entryName;
    row.push(record[key] ?? null);
  });
  return row;
}

export async function pushToSheetsForGivenFieldMapping(
  records: Map<string, any>,
  fieldMapping: IFieldMapping[],
  sheetObj: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetId: string,
  range: string
) {
  const formattedRecords: Record<string, any>[] = [];

  for (const [_, record] of records) {
    formattedRecords.push(record);
  }
  utilPrint(formattedRecords);

  const payload = [];

  payload.push(await setHeaderRowUsingFieldMapping(fieldMapping));

  const values = [];
  for (const record of formattedRecords) {
    const row = await createSheetsValuesArray(fieldMapping, record);
    values.push(row);
  }

  const updatedPayload = payload.concat(values);

  utilPrint({ updatedPayload });

  /* update sheet */
  const response = await updateSingleRangeRecord(
    updatedPayload,
    sheetObj,
    spreadsheetId,
    sheetId,
    range
  );
  /* return sheet response */
  const updatedCells = response.updatedCells;
  utilPrint({ updatedCells, spreadsheet: response.spreadsheetId });
  return updatedCells;
}
