import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import typescript2 from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist/es",
    format: "es",
    sourcemap: true,
  },
  external: ["universal-fire", "common-types", "firebase-key", "firemock"],
  plugins: [
    // json(),
    resolve({
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    typescript2({
      tsconfig: "tsconfig.es.json",
    }),
  ],
};
