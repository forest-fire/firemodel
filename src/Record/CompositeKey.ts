import { IDictionary } from "common-types";
import { Record, Model } from "../index";

export function createCompositeKey(rec: Record<Model>) {
  const model = rec.data;
  return {
    ...{ id: rec.id },
    ...rec.dynamicPathComponents.reduce(
      (prev, key) => ({
        ...prev,
        ...{ [key]: model[key as keyof typeof model] }
      }),
      {}
    )
  };
}

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyString(rec: Record<Model>) {
  const cKey: IDictionary = createCompositeKey(rec);
  return rec.hasDynamicPath
    ? cKey.id +
        Object.keys(cKey)
          .filter(k => k !== "id")
          .map(k => `::${k}:${cKey[k]}`)
    : rec.id;
}
