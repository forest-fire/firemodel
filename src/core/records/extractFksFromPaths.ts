import { Model, Record } from "@/core";

import { IFmPathValuePair } from "@types";
import { pathJoin } from "common-types";

export function extractFksFromPaths<T extends Model>(
  rec: Record<T>,
  prop: keyof T & string,
  paths: IFmPathValuePair[]
) {
  const pathToModel = rec.dbPath;
  const relnType = rec.META.relationship(prop).relType;
  return paths.reduce((acc, p) => {
    const fkProp = pathJoin(pathToModel, prop);

    if (p.path.includes(fkProp)) {
      const parts = p.path.split("/");
      const fkId = relnType === "hasOne" ? p.value : parts.pop();
      acc = acc.concat(fkId);
    }

    return acc;
  }, [] as string[]);
}
