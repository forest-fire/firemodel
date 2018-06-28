import { IDictionary } from "common-types";
import { IAuditChange } from "./Audit";

export function normalized(...args: string[]) {
  return args
    .filter(a => a)
    .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
    .map(a => a.replace(/\./g, "/"));
}

export function slashNotation(...args: string[]) {
  return normalized(...args).join("/");
}

export function dotNotation(...args: string[]) {
  return normalized(...args)
    .join(".")
    .replace("/", ".");
}

export interface IExtendedError extends Error {
  underlying: any;
  code: string;
  details: any[];
}

export function updateToAuditChanges<T = any>(
  changed: IDictionary,
  prior: IDictionary
) {
  return Object.keys(changed).reduce<IAuditChange[]>(
    (prev: IAuditChange[], curr: Extract<keyof T, string>) => {
      const after = changed[curr];
      const before = prior[curr];
      const propertyAction = !before ? "added" : !after ? "removed" : "updated";
      const payload: IAuditChange = {
        before,
        after,
        property: curr,
        action: propertyAction
      };
      prev.push(payload);
      return prev;
    },
    []
  );
}
