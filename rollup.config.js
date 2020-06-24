// import commonjs from "@rollup/plugin-commonjs";
// import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
// import typescript from "@rollup/plugin-typescript";
import typescript2 from "rollup-plugin-typescript2";

const generalConfig = (moduleSystem) => ({
  input: "src/index.ts",
  output: {
    dir: `dist/${moduleSystem}`,
    format: `${moduleSystem}`,
    sourcemap: true,
  },
  external: ["universal-fire", "firemock"],
  plugins: [
    resolve(),
    typescript2({
      rootDir: ".",
      tsconfig: `tsconfig.es.json`,
      typescript: require("ttypescript"),
      declaration: moduleSystem === "es" ? true : false,
      plugins: [
        { transform: "typescript-transform-paths" },
        { transform: "typescript-transform-paths", afterDeclarations: true },
      ],
    }),
  ],
});

export default [generalConfig("es"), generalConfig("cjs")];
