import { IFmDatabasePaths, IFmPathValuePair } from "@/types";

import { FireModelProxyError } from "@/errors";

export function discoverRootPath(
  results: IFmPathValuePair[]
): IFmDatabasePaths {
  try {
    const incomingPaths = results.map((i) => i.path);
    const rootParts = incomingPaths.reduce((acc, curr) => {
      let i = 0;
      while (
        i < acc.length &&
        curr.split("/").slice(0, i).join("/") === acc.slice(0, i).join("/")
      ) {
        i++;
      }

      return i === 1 ? [] : acc.slice(0, i - 1);
    }, incomingPaths[0].split("/"));
    const root = rootParts.join("/");
    const paths = results.reduce((acc: IFmPathValuePair[], curr) => {
      acc = acc.concat({
        path: curr.path.replace(root, ""),
        value: curr.value as keyof typeof results,
      });
      return acc;
    }, []);
    return {
      paths,
      root,
      fullPathNames: Object.keys(results),
    };
  } catch (e) {
    if (e.firemodel) {
      throw e;
    } else {
      throw new FireModelProxyError(e, "Problems in discoverRootPath");
    }
  }
}
