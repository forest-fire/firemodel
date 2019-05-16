import { Model, Record, createCompositeKey } from "..";
import { IDictionary } from "common-types";

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyString<T extends Model = Model>(
  rec: Record<T>
) {
  const cKey: IDictionary = createCompositeKey(rec);
  return rec.hasDynamicPath
    ? cKey.id +
        Object.keys(cKey)
          .filter(k => k !== "id")
          .map(k => `::${k}:${cKey[k]}`)
    : rec.id;
}
