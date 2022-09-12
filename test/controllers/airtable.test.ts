import {
    createAirtableUpdateFieldsGivenFieldMapping,
    createComparableAirtableRecord

} from '../../src/controllers/airtable.js';
import {IntersectionFieldType} from "../../src/controllers/enums";

describe('all airtable tests',  () => {

    const fieldMapping = [{
        entryName: 'pkey',
        airtable: 'pkey',
        dataType: IntersectionFieldType.number
    }, {
        entryName: 'name',
        airtable: 'name',
        dataType: IntersectionFieldType.string
    },{
        entryName: 'boolean_entry_name',
        airtable: 'boolean_airtable',
        dataType: IntersectionFieldType.checkbox
    }, {
        entryName: 'formula_entry_name',
        airtable: 'formula_airtable',
        dataType: IntersectionFieldType.formula
    },{
        entryName: 'lookup',
        airtable: 'lookup',
        dataType: IntersectionFieldType.lookup
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
