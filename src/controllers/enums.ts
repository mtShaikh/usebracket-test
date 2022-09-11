export enum IntersectionFieldType {
    string = 'string',
    people = 'people',
    timestamp = 'timestamp',
    json = 'json',
    number = 'number',
    checkbox = 'checkbox',
    string_array = 'string_array',
    multi_select = 'multi_select',
    url = 'url',
    select = 'select',
    title = 'title',
    rich_text = 'rich_text',
    relation = 'relation',
    formula = 'formula',
    lookup = 'lookup',
    attachment = 'attachment',
    object_id = 'object_id',
}

export enum MutationType {
    update = 'UPDATE',
    upsert = 'UPSERT',
}

/* updated field names to match json convention */
export interface IFieldMapping {
    airtable?: string;
    entryName: string;
    dataType?: IntersectionFieldType;
}