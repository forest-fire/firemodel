const { resolve } = require("path");
module.exports = {
  testMatch: ["**/test/?(*-)+(spec|test).[jt]s?(x)"],

  // Maps a regular expression for a "path" and maps it to a transformer
  // https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    // "<rootDir>/node_modules/(?!(universal-fire|@forest-fire)).+\\.js$",
    resolve(process.cwd(), "node_modules") +
      `/(?!(universal-fire|@forest-fire)).+\\.js$`,
  ],

  // modules which do NOT export CJS must have an entry to
  // https://jestjs.io/docs/en/configuration#modulenamemapper-objectstring-string--arraystring
  moduleNameMapper: {
    "^@/(.*)$": resolve(process.cwd(), "src", "$1"),
  },

  // adds more assertions to the default library that Jest provides
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
};
