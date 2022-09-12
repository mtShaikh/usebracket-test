import { IFieldMapping } from "./enums";
import {
  AirtableConnection,
  AirtableObject,
  createComparableAirtableRecord,
  getAllAirtableRecords,
  pushToAirtableForGivenFieldMapping,
} from "./airtable.js";
import { utilPrint } from "../utils/print.js";
import { MILLISECONDS_PER_HOUR } from "../utils/time.js";
import { pushToSheetsForGivenFieldMapping, SheetsConnection } from "./sheets.js";

export enum DataSourceType {
  airtable = "airtable",
  mongodb = "mongodb",
  postgres = "postgres",
  notion = "notion",
  dynamodb = "dynamodb",
  sheets = "sheets",
}

export interface Connection {
  table: string;
  passwordOrKey: string;
}

export interface DataSource {
  type: DataSourceType;
  configuration: {
    writable: boolean | undefined;
  };
  connectionDetails: AirtableConnection | SheetsConnection;
}

export async function getDataMapGivenDataSource(
  lookBackPeriodInMilliseconds: number | undefined,
  dataSource: DataSource
): Promise<Map<string, any>> {
  let result = new Map();
  switch (dataSource.type) {
    case DataSourceType.airtable: {
      const airtableData = dataSource.connectionDetails as AirtableConnection;

      const airtableLookBackPeriod =
        lookBackPeriodInMilliseconds ??
        (airtableData?.lookBackPeriodInMS
          ? airtableData?.lookBackPeriodInMS / MILLISECONDS_PER_HOUR
          : undefined);
      const returnFieldsByFieldId = airtableData.returnFieldsByFieldId;

      if (
        !airtableData?.base ||
        !airtableData?.table ||
        !airtableData?.passwordOrKey
      ) {
        throw new Error(
          `missing base_id (${airtableData?.base}) or table_id (${airtableData?.table}) or api_key ${airtableData?.passwordOrKey} for airtable`
        );
      }
      result = await getAllAirtableRecords(
        airtableData?.passwordOrKey,
        airtableData?.base,
        airtableData?.table,
        airtableLookBackPeriod,
        returnFieldsByFieldId ?? false
      );
      break;
    }
    case DataSourceType.sheets: {
      break;
    }

    default: {
      throw new Error("No data source given for getDataMapGivenDataSource()");
    }
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}

export async function getComparableRecord(
  source: DataSourceType,
  sourceRecord: any,
  fieldMapping: IFieldMapping[]
): Promise<Map<string, AirtableObject>> {
  let result = new Map();
  switch (source) {
    case DataSourceType.airtable: {
      result = await createComparableAirtableRecord(sourceRecord, fieldMapping);
      break;
    }
    case DataSourceType.sheets: {
      break;
    }
    default: {
      throw new Error("No data source given");
    }
  }

  return new Promise((resolve) => {
    resolve(result);
  });
}

export async function pushToDataSource(
  comparableCollection: any,
  recordIdOrRange: string | undefined,
  fieldMapping: IFieldMapping[],
  dataSource: DataSource
) {
  if (dataSource.configuration.writable) {
    switch (dataSource.type) {
      case DataSourceType.airtable: {
        const airtableData = dataSource.connectionDetails as AirtableConnection;
        if (
          !airtableData?.base ||
          !airtableData?.table ||
          !airtableData?.passwordOrKey
        ) {
          throw new Error(
            `missing base_id (${airtableData?.base}) or table_id (${airtableData?.table}) or AIRTABLE_API_KEY for airtable`
          );
        }
        await pushToAirtableForGivenFieldMapping(
          comparableCollection,
          fieldMapping,
          airtableData.base,
          airtableData.table,
          airtableData?.passwordOrKey,
          recordIdOrRange
        );
        break;
      }
      case DataSourceType.sheets: {
        /* add sheets */
        const sheetsConnectionDetails =
          dataSource.connectionDetails as SheetsConnection;
        if (
          !sheetsConnectionDetails?.table ||
          !sheetsConnectionDetails?.sheet ||
          !sheetsConnectionDetails?.spreadsheet
        ) {
          throw new Error(
            `missing spreadsheet id or sheet id or sheets lib object`
          );
        }
        await pushToSheetsForGivenFieldMapping(
          comparableCollection,
          fieldMapping,
          sheetsConnectionDetails.spreadsheet,
          sheetsConnectionDetails.table,
          sheetsConnectionDetails.sheet,
          recordIdOrRange ?? sheetsConnectionDetails.sheet // if range is not provided then add sheet
        );
        break;
      }
      default: {
        throw new Error("No data source given");
      }
    }
  } else {
    utilPrint({
      notice: `Skipping write to data source because configuration.writable is ${dataSource.configuration.writable}`,
    });
  }
}
