import { IFmChangedProperties, IModel } from "@/types";
const equal = require("fast-deep-equal/es6");

export function compareHashes<T extends IModel>(
  from: Partial<T>,
  to: Partial<T>,
  /**
   * optionally explicitly state properties so that relationships
   * can be filtered away
   */
  modelProps?: Array<keyof T & string>
): IFmChangedProperties<T> {
  const results: IFmChangedProperties<T> = {
    added: [],
    changed: [],
    removed: [],
  };

  from = from ? from : {};
  to = to ? to : {};

  let keys: Array<keyof T & string> = Array.from(
    new Set<keyof T & string>([
      ...(Object.keys(from) as Array<keyof T & string>),
      ...Object.keys(to),
    ] as Array<keyof T & string>)
  )
    // META should never be part of comparison
    .filter((i) => i !== "META")
    // neither should private properties indicated by underscore
    .filter((i) => i.slice(0, 1) !== "_");

  if (modelProps) {
    keys = keys.filter((i) => modelProps.includes(i));
  }

  keys.forEach((i) => {
    if (!to[i]) {
      results.added.push(i);
    } else if (from[i] === null) {
      results.removed.push(i);
    } else if (!equal(from[i], to[i])) {
      results.changed.push(i);
    }
  });

  return results;
}
