const { resolve } = require("path");
module.exports = {
  testMatch: ["**/test/?(*-)+(spec|test).[jt]s?(x)"],
  // https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  // Maps a regular expression for a "path" and maps it to a transformer
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(universal-fire|@forest-fire|lodash-es)).+\\.js$",
  ],
  // https://jestjs.io/docs/en/configuration#modulenamemapper-objectstring-string--arraystring
  // modules which do NOT export CJS must have an entry to
  moduleNameMapper: {
    // map lodash-es to lodash (aka, CJS implementation)
    "^lodash-es$": "<rootDir>/node_modules/lodash/lodash.js",
    "@/private": "<rootDir>/src/private",
    "@types": "<rootDir>/src/types/index",
    "@errors": "<rootDir>/errors/index",
    "@decorators": "<rootDir>/decorators/index",
    // "^@/(.*)$": resolve(__dirname, "./src/$1"),
  },
  // adds more assertions to the default library that Jest provides
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
};
