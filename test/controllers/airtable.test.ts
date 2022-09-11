import {
    createAirtableUpdateFieldsGivenFieldMapping,
    createComparableAirtableRecord

} from '../../src/controllers/airtable.js';
import {IntersectionFieldType} from "../../src/controllers/enums";

describe('all airtable tests',  () => {

    const fieldMapping = [{
        ENTRY_NAME: 'pkey',
        AIRTABLE: 'pkey',
        DATA_TYPE: IntersectionFieldType.number
    }, {
        ENTRY_NAME: 'name',
        AIRTABLE: 'name',
        DATA_TYPE: IntersectionFieldType.string
    },{
        ENTRY_NAME: 'boolean_entry_name',
        AIRTABLE: 'boolean_airtable',
        DATA_TYPE: IntersectionFieldType.checkbox
    }, {
        ENTRY_NAME: 'formula_entry_name',
        AIRTABLE: 'formula_airtable',
        DATA_TYPE: IntersectionFieldType.formula
    },{
        ENTRY_NAME: 'lookup',
        AIRTABLE: 'lookup',
        DATA_TYPE: IntersectionFieldType.lookup
    }];

    test('createComparableAirtableRecord creates a comparable entity and parses string numbers and turns missing booleans into false', async () => {
        const currentAirtable = {pkey: '5', name: 'john'};
        const expected = {pkey: 5, name: 'john', boolean_entry_name: false, formula_entry_name: null, lookup: null};


        const result = await createComparableAirtableRecord(currentAirtable, fieldMapping);
        expect(result).toStrictEqual(expected);
    })

    test('createComparableAirtableRecord creates a comparable entity and parses null into false and leaves out fields that are not in field mapping', async () => {
        const currentAirtable = {pkey: 5, name: 'john', boolean_airtable: null, missing_key: true, lookup: false};
        const expected = {pkey: 5, name: 'john', boolean_entry_name: false, formula_entry_name: null, lookup: false};

        const result = await createComparableAirtableRecord(currentAirtable, fieldMapping)
        expect(result).toStrictEqual(expected);
    })

    test('createAirtableUpdateFieldsGivenFieldMapping filters out both lookup and formula types', async () => {
        const currentAirtable = {pkey: 5, name: 'john',  formula_entry_name: 'calculated_field', lookup: 'calculated_field'};
        const expected = {pkey: 5, name: 'john', boolean_airtable: undefined};

        const result = await createAirtableUpdateFieldsGivenFieldMapping(currentAirtable, fieldMapping);
        expect(result).toStrictEqual(expected);
    })
})
