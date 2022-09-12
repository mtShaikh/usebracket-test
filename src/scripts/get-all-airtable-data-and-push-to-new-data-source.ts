import minimist from "minimist";
import {utilPrint} from "../utils/print.js";
import {
    DataSourceType,
    getComparableRecord,
    pushToDataSource,
    getDataMapGivenDataSource,
} from "../controllers/data-sources.js";
import {IntersectionFieldType} from "../controllers/enums.js";
import { getSheetsObj } from "../lib/sheets.js";

const ARG_API_KEY = 'apiKey'
const ARG_BASE_ID = 'baseId'
const ARG_TABLE_ID = 'tableId'
const ARG_LOOKBACK_PERIOD = 'lookback'

async function getAllAirtableDataAndPushToNewDataSource(apiKey: string, baseId: string, tableId: string, lookbackPeriod?: number) {
    const airtableDataSource = {
        type: DataSourceType.airtable,
        configuration: {
            writable: false,
        },
        connectionDetails: {
            lookBackPeriodInMS: lookbackPeriod,
            base: baseId,
            table: tableId,
            passwordOrKey: apiKey,
            returnFieldsByFieldId: false,
        }
    }
    /* const outputDataSource = {
        type: DataSourceType.airtable,
        configuration: {
            writable: true,
        },
        connectionDetails: {
            lookBackPeriodInMS: lookbackPeriod,
            baseId: baseId,
            tableId: "tblyzZHExLLC4r15L",
            apiKey: apiKey,
            returnFieldsByFieldId: false,
        }
    } */

    const sheetObj = await getSheetsObj()

    const outputDataSource = {
        type: DataSourceType.sheets,
        configuration: {
            writable: true,
        },
        connectionDetails: {
            spreadsheet: sheetObj,
            passwordOrKey: "",
            table: "1ocf3nVE_miILspYdhykstRwyGIT_60zwaINYzVDbeck",
            sheet: "Sheet1"
        }
    }

    const fieldMapping = [{
        entryName: 'Status',
        airtable: 'Status',
        dataType: IntersectionFieldType.select
    }, {
        entryName: 'Name',
        airtable: 'Name',
        dataType: IntersectionFieldType.string
    }, {
        entryName: 'isAvailable',
        airtable: 'isOK',
        dataType: IntersectionFieldType.checkbox
    },
    {
        entryName: 'formula',
        airtable: 'formula field',
        dataType: IntersectionFieldType.formula
    }]

    if (apiKey && baseId && tableId) {
        // 1. read data from airtable,
        const airtableRecords = await getDataMapGivenDataSource(lookbackPeriod, airtableDataSource);
        utilPrint({airtableRecords})
        // 2. transform it to a data source agnostic object
        const reformattedRecords = new Map()
        for (const [key, value] of airtableRecords) {
            // TODO: Create a data source agnostic object for each airtable object
            reformattedRecords.set(key, await getComparableRecord(DataSourceType.airtable, value, fieldMapping))
        }

        // 3. write back to a new data source
        // for (const [key, value] of reformattedRecords) {
        // }
        // TODO: Push each record to data source (in this example, we're writing to postgres)
        await pushToDataSource(reformattedRecords, undefined, fieldMapping, outputDataSource)

        // utilPrint({airtableRecords})
        return true;
    } else {
        throw new Error("MISSING ARGUMENTS")
    }
}

async function run() {
    const argv = minimist(process.argv.slice(2));
    const apiKey: string = argv[ARG_API_KEY];
    const baseId: string = argv[ARG_BASE_ID];
    const tableId: string = argv[ARG_TABLE_ID];
    const lookbackPeriod: number = argv[ARG_LOOKBACK_PERIOD];

    return await getAllAirtableDataAndPushToNewDataSource(apiKey, baseId, tableId, lookbackPeriod);
}

run().then(() => {
    console.log('finished script')
});