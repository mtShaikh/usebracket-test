import {
    IntersectionFieldType,
    IFieldMapping,
} from "./enums.js";
import {Optional} from "typescript-optional";
import airtable from "airtable";
import {utilPrint} from "../utils/print.js";
import _ from "lodash";

export interface AirtableObject {
    id?: string
}

export enum AirtableAction {
    CREATE,
    UPDATE
}

export const getAllAirtableRecords = async (apiKey: string, baseId: string, tableId: string, lookBackPeriod: number | undefined, returnFieldsByFieldId: boolean): Promise<any> => {
    const airtableMap = new Map();

    const base = new airtable({apiKey: apiKey}).base(baseId);

    const params = {}

    if (lookBackPeriod) {
        _.set(params, 'filterByFormula', `IS_AFTER(CREATED_TIME(), DATEADD(NOW(), -${lookBackPeriod}, 'h'))`)
    }

    if (returnFieldsByFieldId) {
        _.set(params, 'returnFieldsByFieldId', returnFieldsByFieldId)
    }

    const records = await base(tableId)
        .select(params)
        .all()

    records.forEach(function (record) {
        airtableMap.set(record.id, record.fields)
    });

    return new Promise((resolve) => {
        resolve(airtableMap)
    })
}

export const createAirtableUpdateFieldsGivenFieldMapping = async (record: any, fieldMapping: IFieldMapping[]): Promise<any> => {
    const payloadToAirtable = {}
    Object.entries(fieldMapping).forEach(([entry, fieldMappingValue]) => {
        const key = fieldMappingValue.entryName;
        const newKey = fieldMappingValue.airtable;
        const dataType = fieldMappingValue.dataType;
        if (key && newKey && dataType && dataType !== IntersectionFieldType.formula && dataType !== IntersectionFieldType.lookup && dataType !== IntersectionFieldType.attachment) {
            _.set(payloadToAirtable, newKey, record[key])
        }
    });

    return new Promise((resolve) => {
        resolve(payloadToAirtable)
    })
}

export const createComparableAirtableRecord = async (sourceAirtable: any, fieldMapping: IFieldMapping[], primaryKey?: string, primaryKeyValue?: string): Promise<any> => {
    const comparableAirtableRecord = {}
    const currentAirtable = {...sourceAirtable}

    if (!currentAirtable) {
        return new Promise((resolve) => {
            resolve(comparableAirtableRecord)
        })
    }

    // this logic overrides the previous primary key to be the one provided as an argument
    if (typeof primaryKey !== 'undefined' && typeof primaryKeyValue !== 'undefined') {
        if (currentAirtable) {
            currentAirtable[primaryKey] = primaryKeyValue;
        }
    }

    Object.entries(fieldMapping).forEach(([, fieldMappingValue]) => {
        const key = fieldMappingValue.airtable;
        const newKey = fieldMappingValue.entryName;
        const fieldType = fieldMappingValue.dataType

        if (!key || !newKey) {
            throw new Error('Missing Airtable Key');

        }
        let value = _.get(currentAirtable, key, null)
        _.set(comparableAirtableRecord, newKey, value ?? null)

        // normalize any fields for comparison
        switch (fieldType) {
            case IntersectionFieldType.people: {
                const outputArray: string[] = []
                currentAirtable[key]?.forEach((value: any) => {
                    if (value && value.email) {
                        outputArray.push(value?.email)
                    } else {
                        console.warn(`value was not present for people array: ${value}`)
                    }
                })

                value =  outputArray.length === 0 ? null : outputArray;
                _.set(comparableAirtableRecord, newKey, value)
                break;
            }
            case IntersectionFieldType.timestamp: {
                value =  currentAirtable?.[key] === null || currentAirtable?.[key] === undefined ? null : new Date(currentAirtable?.[key]);
                _.set(comparableAirtableRecord, newKey, value);
                break;
            }
            case IntersectionFieldType.attachment: {
                const outputArray: string[] = []

                currentAirtable[key]?.forEach((value: any) => {
                    if (value && value.url) {
                        const trimmedUrl = value?.url?.split('?')[0];
                        outputArray.push(trimmedUrl)
                    } else {
                        console.warn(`value was not present for attachment array: ${value}`)
                    }
                })

                _.set(comparableAirtableRecord, newKey, outputArray.length === 0 ? null : outputArray);
                break;
            }
            case IntersectionFieldType.json: {
                _.set(comparableAirtableRecord, newKey, JSON.parse(value));
                break;
            }
            case IntersectionFieldType.number: {
                _.set(comparableAirtableRecord, newKey, value === null || value === undefined ? null : parseFloat(value));
                break;
            }
            case IntersectionFieldType.checkbox: {
                if (value === null || value === undefined) {
                    _.set(comparableAirtableRecord, newKey, false);
                }
                break;
            }
            case IntersectionFieldType.string_array:
            case IntersectionFieldType.multi_select: {
                if (value === null || (Array.isArray(value) && value?.length === 0)) {
                    _.set(comparableAirtableRecord, newKey, null);
                }
                break;
            }
            default:
                break;
        }
    });

    return new Promise((resolve) => {
        resolve(comparableAirtableRecord)
    })
}

export async function mutateAirtableRecord(data: {id?: any}, airtableAction: AirtableAction, airtableRecordId: Optional<string>, baseId: string, tableName: string, apiKey: string): Promise<string> {
    const base = new airtable({apiKey: apiKey}).base(baseId);
    switch (airtableAction) {
        case AirtableAction.CREATE: {
            const createResponse = await base(tableName).create(data, {typecast: true})
                .catch(e => {
                    utilPrint({e})
                })
            /* refactor axios call into lib method call
            const createResponse = await axios({
                url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': "application/json"
                },
                data: {
                    fields: event,
                    typecast: true
                }
            }).catch(e => {
                utilPrint({e})
                return;
            }); */
            if (createResponse) {
                return new Promise(resolve => {
                    resolve(createResponse?.getId());
                })
            }
            return new Promise(resolve => resolve(data.id!))
        }
        case AirtableAction.UPDATE: {
            const updateResponse = await base(tableName).update(airtableRecordId.orElseThrow(() => {
                throw new Error('SHOULD NOT HAVE NULL AIRTABLE ID')
            }), data, {typecast: true})
                .catch(e => {
                    utilPrint({e})
                })

            if (updateResponse?.id) {
                return new Promise(resolve => {
                    resolve(updateResponse?.id);
                })
            }
            return new Promise(resolve => resolve(data.id!))
        }
    }
}

export async function pushToAirtableForGivenFieldMapping(comparableCollection: any, fieldMapping: IFieldMapping[], baseId: string | undefined, tableId: string | undefined, apiKey: string | undefined, airtableRecordId: string | undefined,) {
    if (apiKey === undefined || baseId === undefined || tableId === undefined) {
        utilPrint({apiKey, baseId, tableId})
        throw new Error("missing base id or table id");
    }
    const payloadToAirtable = await createAirtableUpdateFieldsGivenFieldMapping(comparableCollection, fieldMapping);
    utilPrint({payloadToAirtable})
    let maybeAirtableRecordId: Optional<string> = Optional.ofNullable(airtableRecordId)
    if (maybeAirtableRecordId.isPresent()) {
        maybeAirtableRecordId = Optional.ofNullable(await mutateAirtableRecord(payloadToAirtable, AirtableAction.UPDATE, maybeAirtableRecordId, baseId, tableId, apiKey));
    } else {
        maybeAirtableRecordId = Optional.ofNullable(await mutateAirtableRecord(payloadToAirtable, AirtableAction.CREATE, maybeAirtableRecordId, baseId, tableId, apiKey));
    }

    return maybeAirtableRecordId;
}