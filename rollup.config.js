export default {
  input: "dist/esnext/index.js",
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
        "common-types": "common-types",
        "serialized-query": "serialized-query"
      }
    }
  ]
};
