import util from "util";

/**
 * It prints out the object's keys and values.
 * @param {any} varObj - any - The object you want to print.
 *
 * e.g. utilPrint({event, object_one, key: value})
 */
export const utilPrint = (varObj: any) => {
    Object.keys(varObj).forEach((arg, i) => { console.log(Object.keys(varObj)[i] + ": " + util.inspect(varObj?.[arg], { showHidden: false, depth: null, colors: true, maxArrayLength: null}));})
}

export const getUtilPrint = (varObj: any) => {
    let stringOutput = ''
    Object.keys(varObj).forEach((arg, i) => { stringOutput += `${Object.keys(varObj)[i]}` + ": " + util.inspect(varObj?.[arg], false, null, true) + '\n'})
    return stringOutput;
}

export const getArgs = (varObj: any) => {
    const keys = Object.keys(varObj);
    process.argv.slice(2).forEach((arg, i) => varObj[keys[i]] = arg);
    return varObj;
}
