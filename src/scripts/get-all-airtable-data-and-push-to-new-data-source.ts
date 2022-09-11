import minimist from "minimist";
import {utilPrint} from "../utils/print.js";
import {
    DataSourceType,
    getComparableRecord,
    pushToDataSource,
    getDataMapGivenDataSource,
} from "../controllers/data-sources.js";
import {IntersectionFieldType} from "../controllers/enums.js";

const ARG_API_KEY = 'apiKey'
const ARG_BASE_ID = 'baseId'
const ARG_TABLE_ID = 'tableId'
const ARG_LOOKBACK_PERIOD = 'lookback'

async function getAllAirtableDataAndPushToNewDataSource(apiKey: string, baseId: string, tableId: string, lookbackPeriod: number) {
    const airtableDataSource = {
        type: DataSourceType.airtable,
        configuration: {
            writable: false,
        },
        connection_details: {
            lookBackPeriodInMS: lookbackPeriod,
            baseId: baseId,
            tableId: tableId,
            apiKey: apiKey,
            returnFieldsByFieldId: false,
        }
    }
    const postgresDataSource = {
        type: DataSourceType.postgres,
        configuration: {
            writable: true,
        },
        connection_details: {
            lookBackPeriodInMS: lookbackPeriod,
            baseId: baseId,
            tableId: tableId,
            apiKey: apiKey,
            returnFieldsByFieldId: false,
        }
    }
    const fieldMapping = [{
        ENTRY_NAME: 'id',
        AIRTABLE: 'id',
        DATA_TYPE: IntersectionFieldType.string
    }, {
        ENTRY_NAME: 'name',
        AIRTABLE: 'name',
        DATA_TYPE: IntersectionFieldType.string
    }, {
        ENTRY_NAME: 'country',
        AIRTABLE: 'Country',
        DATA_TYPE: IntersectionFieldType.string
    }]

    if (apiKey && baseId && tableId && lookbackPeriod) {
        // 1. read data from airtable,
        const airtableRecords = await getDataMapGivenDataSource(lookbackPeriod, airtableDataSource);
        utilPrint({airtableRecords})

        // 2. transform it to a data source agnostic object
        const reformattedRecords = new Map()
        for (const record of airtableRecords) {
            // TODO: Create a data source agnostic object for each airtable object
            // reformattedRecords.set(record[0], await getComparableRecord(DataSourceType.postgres, record[1], fieldMapping))
        }

        // 3. write back to a new data source
        for (const record of reformattedRecords) {
            // TODO: Push each record to data source (in this example, we're writing to postgres)
            // await pushToDataSource(DataSourceType.postgres, record[0], fieldMapping, postgresDataSource)
        }

        utilPrint({airtableRecords})
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