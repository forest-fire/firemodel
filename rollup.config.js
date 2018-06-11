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
      sourcemap: true
      // globals: {
      //   "firebase-api-surface": "firebase-api-surface",
      //   "typed-conversions": "convert",
      //   "wait-in-parallel": "Parallel",
      //   "common-types": "common-types",
      //   "serialized-query": "serialized-query"
      // }
    }
  ]
};
