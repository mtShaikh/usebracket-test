import { getArray } from "../controllers/sheets.js";
import { getSheetsObj } from "../lib/sheets.js";

async function run() {
    const sheet = await getSheetsObj()
    
    console.log(await getArray(sheet, "1ocf3nVE_miILspYdhykstRwyGIT_60zwaINYzVDbeck","Sheet1"))
}

run().then(() => {
    console.log('finished script')
});