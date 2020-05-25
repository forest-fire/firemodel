import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    // {
    //   file: "dist/firemodel.cjs.js",
    //   format: "cjs",
    //   name: "FireModel",
    //   sourcemap: true,
    // },

    dir: "dist/es",
    format: "es",
    sourcemap: true,
  },

  external: [
    "@forest-fire/base-serializer",
    "common-types",
    "typed-conversions",
    "dexie",
    "date-fns",
    "get-value",
    "set-value",
    "firebase-key",
    "fast-deep-equal",
    "fast-copy",
    "reflect-metadata",
    "universal-fire",
    "wait-in-parallel",
  ],
  plugins: [
    typescript({
      rootDir: ".",
      tsconfig: "tsconfig.es.json",
    }),
  ],
};
