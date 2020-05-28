import alias from "@rollup/plugin-alias";
import { resolve } from "path";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: {
      dir: "dist/es",
      format: "es",
      sourcemap: true,
    },

    external: [
      "@forest-fire/base-serializer",
      "common-types",
      "typed-conversions",
      "dexie",
      "firemock",
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
        /** this is only really needed for monorepos */
        rootDir: ".",
        tsconfig: "tsconfig.es.json",
      }),
      alias({
        entries: {
          private: resolve(__dirname, "src/private"),
        },
      }),
      // alias(
      //   {
      //     entries: [
      //       { find: "private", replacement: resolve(__dirname, "src/private") },
      //     ],
      //   }
      // ),
    ],
  },
  // {
  //   input: "src/index.ts",
  //   {
  //     file: "dist/firemodel.cjs.js",
  //     format: "cjs",
  //     name: "FireModel",
  //     sourcemap: true,
  //   },

  //   external: [
  //     "@forest-fire/base-serializer",
  //     "common-types",
  //     "typed-conversions",
  //     "dexie",
  //     "date-fns",
  //     "get-value",
  //     "set-value",
  //     "firebase-key",
  //     "fast-deep-equal",
  //     "fast-copy",
  //     "reflect-metadata",
  //     "universal-fire",
  //     "wait-in-parallel",
  //   ],
  //   plugins: [
  //     typescript({
  //       rootDir: ".",
  //       tsconfig: "tsconfig.es.json",
  //     }),
  //   ],
  // },
];
