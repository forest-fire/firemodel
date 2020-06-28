import { IDictionary } from "common-types";

/**
 * Gets a value in a deeply nested object. This is a replacement to `lodash.get`
 *
 * @param obj the base object to get the value from
 * @param dotPath the path to the object, using "." as a delimiter
 * @param defaultValue optionally you may state a default value if the operation results in `undefined`
 */
export function get<T = any>(
  obj: IDictionary,
  dotPath: string,
  defaultValue?: any
): T {
  const parts = dotPath.split(".");
  let value: any = obj;

  parts.forEach((p) => {
    value =
      typeof value === "object" && Object.keys(value).includes(p)
        ? value[p as keyof typeof value]
        : undefined;
  });

  return value ? value : defaultValue;
}
