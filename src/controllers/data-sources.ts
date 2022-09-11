import {IFieldMapping} from "./enums.js";
import {
    AirtableObject,
    createComparableAirtableRecord,
    getAllAirtableRecords,
    pushToAirtableForGivenFieldMapping
} from "./airtable.js";
import {utilPrint} from "../utils/print.js";
import {MILLISECONDS_PER_HOUR} from "../utils/time.js";

export enum DataSourceType {
    airtable = 'airtable',
    mongodb = 'mongodb',
    postgres = 'postgres',
    notion = 'notion',
    dynamodb = 'dynamodb',
}

export interface DataSource {
    type: DataSourceType,
    configuration: {
        writable: boolean | undefined;
    }
    connection_details: {
        look_back_period_in_ms: number;
        base_id: string;
        table_id: string;
        api_key: string;
        return_fields_by_field_id: boolean;
    }
}

export async function getDataMapGivenDataSource(lookBackPeriodInMilliseconds: number | undefined, dataSource: DataSource): Promise<Map<string, any>> {
    let result = new Map();
    switch (dataSource.type) {
        case DataSourceType.airtable: {
            const airtableData = dataSource.connection_details

            const airtableLookBackPeriod = lookBackPeriodInMilliseconds ?? (airtableData?.look_back_period_in_ms ? (airtableData?.look_back_period_in_ms / MILLISECONDS_PER_HOUR) : undefined);
            const returnFieldsByFieldId = airtableData.return_fields_by_field_id;
            utilPrint({
                airtableLookBackPeriod,
                lookBackPeriodInMilliseconds,
                airtable_look_back_period_in_ms: airtableData?.look_back_period_in_ms
            })

            if (!(airtableData?.base_id) || !(airtableData?.table_id) || !(airtableData?.api_key)) {
                throw new Error(`missing base_id (${airtableData?.base_id}) or table_id (${airtableData?.table_id}) or api_key ${airtableData?.api_key} for airtable`);
            }
            result = await getAllAirtableRecords(airtableData?.api_key, airtableData?.base_id, airtableData?.table_id, airtableLookBackPeriod, returnFieldsByFieldId);
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
                if (!(airtableData?.base_id) || !(airtableData?.table_id) || !(airtableData?.api_key)) {
                    throw new Error(`missing base_id (${airtableData?.base_id}) or table_id (${airtableData?.table_id}) or AIRTABLE_API_KEY for airtable`);
                }

                await pushToAirtableForGivenFieldMapping(comparableCollection, fieldMapping, airtableData.base_id, airtableData.table_id, airtableData?.api_key, recordId);
                break;
            }
            case DataSourceType.postgres: {
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