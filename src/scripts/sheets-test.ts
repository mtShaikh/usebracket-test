import { getObjectArray, getSheetsObj } from "../controllers/sheets.js";

async function run() {
    const sheet = await getSheetsObj()
    
    console.log(await getObjectArray(sheet, "1ocf3nVE_miILspYdhykstRwyGIT_60zwaINYzVDbeck","A1:C1"))
}

run().then(() => {
    console.log('finished script')
});