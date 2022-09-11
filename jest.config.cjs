module.exports = {
    "preset": "ts-jest/presets/default-esm",
    "globals": {
        "ts-jest": {
            "useESM": true
        }
    },
    testPathIgnorePatterns: [".d.ts", ".js", '<rootDir>/node_modules/'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};



// // jest.config.ts
// import  { InitialOptionsTsJest } from 'ts-jest'
// // import { defaults as tsjPreset } from 'ts-jest/presets'
// import { defaultsESM as tsjPreset } from 'ts-jest/presets'
// // import { jsWithTs as tsjPreset } from 'ts-jest/presets'
// // import { jsWithTsESM as tsjPreset } from 'ts-jest/presets'
// // import { jsWithBabel as tsjPreset } from 'ts-jest/presets'
// // import { jsWithBabelESM as tsjPreset } from 'ts-jest/presets'
//
// const config: InitialOptionsTsJest = {
//     // [...]
//     transform: {
//         ...tsjPreset.transform,
//         // [...]
//     },
// }
//
// export default config