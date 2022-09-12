import { IntersectionFieldType } from "../../src/controllers/enums";
import {
  createSheetsValuesArray,
  setHeaderRowUsingFieldMapping,
} from "../../src/controllers/sheets.js";

describe("all sheets tests", () => {
  const fieldMapping = [
    {
      entryName: "pkey",
      airtable: "pkey",
      dataType: IntersectionFieldType.number,
    },
    {
      entryName: "name",
      airtable: "name",
      dataType: IntersectionFieldType.string,
    },
    {
      entryName: "boolean_entry_name",
      airtable: "boolean_airtable",
      dataType: IntersectionFieldType.checkbox,
    },
    {
      entryName: "formula_entry_name",
      airtable: "formula_airtable",
      dataType: IntersectionFieldType.formula,
    },
  ];

  test("setHeaderRowUsingFieldMapping creates a header row using the field mapping", async () => {
    const expected = ["pkey", "name", "boolean_entry_name", "formula_entry_name"];

    const result = await setHeaderRowUsingFieldMapping(fieldMapping);
    expect(result).toStrictEqual(expected);
  });

  test("createSheetsValuesArray creates an array for all the data rows from the mapped records", async () => {
    const record = 
      {
        pkey: "Todo",
        name: "helloword",
        boolean_entry_name: false,
        formula_entry_name: "foobar"
      };
    const expected = ["Todo", "helloword", false, "foobar"];
    const result = await createSheetsValuesArray(fieldMapping, record);
    expect(result).toStrictEqual(expected);
  });

  test("createSheetsValuesArray replaces missing fields with a null", async () => {
    const record = 
      {
        pkey: "Todo",
        formula_entry_name: "foobar"
      };
    const expected = ["Todo", null, null, "foobar"];
    const result = await createSheetsValuesArray(fieldMapping, record);
    expect(result).toStrictEqual(expected);
  });
});
