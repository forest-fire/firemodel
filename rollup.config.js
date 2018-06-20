import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/firemodel.cjs.js",
      format: "cjs",
      name: "FireModel",
      sourcemap: true
    },
    {
      file: "dist/firemodel.umd.js",
      format: "umd",
      name: "FireModel",
      sourcemap: true,
      globals: {
        lodash: "lodash",
        "firebase-key": "fbKey",
        "wait-in-parallel": "Parallel",
        "common-types": "commonTypes",
        "serialized-query": "serializedQuery"
      }
    },
    {
      file: "dist/firemodel.es2015.js",
      format: "es",
      sourcemap: true
    }
  ],
  external: [
    "firebase-key",
    "reflect-metadata",
    "serialized-query",
    "lodash",
    "common-types",
    "abstracted-firebase",
    "typed-conversions"
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.esnext.json"
    })
  ]
};
