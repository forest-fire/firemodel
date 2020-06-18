module.exports = function(w) {
  return {
    // runAllTestsInAffectedTestFile: true,
    files: [
      'src/**/*',
      'jest.config.js',
      'package.json',
      'tsconfig.json',
      { pattern: "env.yml", instrument: false },
      { pattern: "test/jest.setup.js", instrument: false },
      { pattern: "test/testing/test-console.ts", instrument: false },
      { pattern: "test/testing/**/*.ts", instrument: true },
      { pattern: "test/dexie-test-data.ts", instrument: true },
    ],

    tests: ["test/**/*-spec.ts"],

    env: {
      type: "node",
      runner: "node"
    },

    setup() {
      if (!process.env.AWS_STAGE) {
        process.env.AWS_STAGE = "test";
      }

      if (!console._restored) {
        console.log("console.log stream returned to normal for test purposes");
        console.log = function() {
          return require("console").Console.prototype.log.apply(
            this,
            arguments
          );
        };
        console.error = function() {
          return require("console").Console.prototype.error.apply(
            this,
            arguments
          );
        };
        console._restored = true;
      }
    },

    testFramework: "jest",
    debug: true
  };
};
