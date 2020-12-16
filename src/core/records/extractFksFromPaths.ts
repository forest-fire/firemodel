import { IFmPathValuePair } from "@/types";
import { IModel } from "@/types";
import { Record } from "@/core";
import { pathJoin } from "@/util";

export function extractFksFromPaths<T extends IModel>(
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
