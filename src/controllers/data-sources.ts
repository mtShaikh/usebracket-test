import {IFieldMapping} from "./enums";
import {
    AirtableObject,
    createComparableAirtableRecord,
    getAllAirtableRecords,
    pushToAirtableForGivenFieldMapping
} from "./airtable";
import {utilPrint} from "../utils/print";
import {MILLISECONDS_PER_HOUR} from "../utils/time";

export enum DataSourceType {
    airtable = 'airtable',
    mongodb = 'mongodb',
    postgres = 'postgres',
    notion = 'notion',
    dynamodb = 'dynamodb',
    sheets = 'sheets'
}

export interface DataSource {
    type: DataSourceType,
    configuration: {
        writable: boolean | undefined;
    }
    connection_details: {
        lookBackPeriodInMS: number;
        baseId: string;
        tableId: string;
        apiKey: string;
        returnFieldsByFieldId: boolean;
    }
}

export async function getDataMapGivenDataSource(lookBackPeriodInMilliseconds: number | undefined, dataSource: DataSource): Promise<Map<string, any>> {
    let result = new Map();
    switch (dataSource.type) {
        case DataSourceType.airtable: {
            const airtableData = dataSource.connection_details

            const airtableLookBackPeriod = lookBackPeriodInMilliseconds ?? (airtableData?.lookBackPeriodInMS ? (airtableData?.lookBackPeriodInMS / MILLISECONDS_PER_HOUR) : undefined);
            const returnFieldsByFieldId = airtableData.returnFieldsByFieldId;
            utilPrint({
                airtableLookBackPeriod,
                lookBackPeriodInMilliseconds,
                airtable_look_back_period_in_ms: airtableData?.lookBackPeriodInMS
            })

            if (!(airtableData?.baseId) || !(airtableData?.tableId) || !(airtableData?.apiKey)) {
                throw new Error(`missing base_id (${airtableData?.baseId}) or table_id (${airtableData?.tableId}) or api_key ${airtableData?.apiKey} for airtable`);
            }
            result = await getAllAirtableRecords(airtableData?.apiKey, airtableData?.baseId, airtableData?.tableId, airtableLookBackPeriod, returnFieldsByFieldId);
            break;
        }
        case DataSourceType.postgres: {
            break;
        }

        default: {
            throw new Error('No data source given for getDataMapGivenDataSource()')
        }
    }

    return new Promise((resolve) => {
        resolve(result)
    })
}

export async function getComparableRecord(source: DataSourceType, sourceRecord: any, FIELD_MAPPING: IFieldMapping[]): Promise<Map<string, AirtableObject>> {
    let result = new Map();
    switch (source) {
        case DataSourceType.airtable: {
            result = await createComparableAirtableRecord(sourceRecord, FIELD_MAPPING);
            break;
        }
        case DataSourceType.postgres: {
            break;
        }
        default: {
            throw new Error('No data source given')
        }
    }

    return new Promise((resolve) => {
        resolve(result)
    })
}

export async function pushToDataSource(comparableCollection: any, recordId: string | undefined, fieldMapping: IFieldMapping[], dataSource: DataSource) {
    if (dataSource.configuration.writable) {
        switch (dataSource.type) {
            case DataSourceType.airtable: {
                const airtableData = dataSource.connection_details
                if (!(airtableData?.baseId) || !(airtableData?.tableId) || !(airtableData?.apiKey)) {
                    throw new Error(`missing base_id (${airtableData?.baseId}) or table_id (${airtableData?.tableId}) or AIRTABLE_API_KEY for airtable`);
                }

                await pushToAirtableForGivenFieldMapping(comparableCollection, fieldMapping, airtableData.baseId, airtableData.tableId, airtableData?.apiKey, recordId);
                break;
            }
            case DataSourceType.sheets: {
                /* add sheets */
                break;
            }
            default: {
                throw new Error('No data source given')
            }
        }
    } else {
        utilPrint({notice: `Skipping write to data source because configuration.writable is ${dataSource.configuration.writable}`})
    }
}