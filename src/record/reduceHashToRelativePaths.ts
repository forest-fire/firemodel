import { IDictionary } from "common-types";
import { IFmDatabasePaths } from "../@types/general";

export function reduceHashToRelativePaths(
  results: IDictionary
): IFmDatabasePaths {
  const baseParts = Object.keys(results).reduce((acc, curr) => {
    let i = 0;
    while (i < acc.length && curr.split("/")[i] === acc[i]) {
      i++;
    }
  }, results[0].split("/"));
  const root = baseParts.join("/");
  const paths = Object.keys(results).reduce(
    (acc, key) => {
      acc = acc.concat({
        path: key.replace(root, ""),
        value: results[key as keyof typeof results]
      });
      return acc;
    },
    [] as Array<{ path: string; value: string }>
  );
  return {
    paths,
    root,
    fullPathNames: Object.keys(results)
  };
}
