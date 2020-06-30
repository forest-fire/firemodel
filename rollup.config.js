import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
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
    commonjs(),
    resolve(),
    typescript2({
      rootDir: ".",
      tsconfig: `tsconfig.es.json`,
      typescript: require("ttypescript"),
      declaration: moduleSystem === "es" ? true : false,
    }),
  ],
});

export default [generalConfig("es"), generalConfig("cjs")];
