module.exports = {
  testMatch: ["**/test/?(*-)+(spec|test).[jt]s?(x)"],
  // https://jestjs.io/docs/en/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
  // Maps a regular expression for a "path" and maps it to a transformer
  transform: {
    "(lodash-es).+\\.js$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(universal-fire|@forest-fire)).+\\.js$",
  ],
  // https://jestjs.io/docs/en/configuration#modulenamemapper-objectstring-string--arraystring
  // modules which do NOT export CJS must have an entry to
  moduleNameMapper: {
    // "^universal-fire$":
    //   "<rootDir>/node_modules/universal-fire/dist/es/index.js",
  },
  // adds more assertions to the default library that Jest provides
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
};
