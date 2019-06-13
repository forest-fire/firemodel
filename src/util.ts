import { IDictionary } from "common-types";
import { IAuditChange } from "./Audit";
import { Model } from "./Model";
import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "./decorators/model-meta/property-store";
import equal from "fast-deep-equal";

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

export interface IComparisonResult {
  added: string[];
  changed: string[];
  removed: string[];
}

export function compareHashes<T extends IDictionary = IDictionary>(
  from: Partial<T>,
  to: Partial<T>
) {
  const results: IComparisonResult = {
    added: [],
    changed: [],
    removed: []
  };

  from = from ? from : {};
  to = to ? to : {};

  const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
  Array.from(keys).forEach(i => {
    if (!to[i]) {
      results.added.push(i);
    } else if (!from[i]) {
      results.removed.push(i);
    } else if (!equal(from, to)) {
      results.changed.push(i);
    }
  });

  return results;
}

export function getAllPropertiesFromClassStructure<T extends Model>(model: T) {
  const modelName = model.constructor.name;
  const properties =
    hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(propertiesByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties.map(p => p.property);
}

export function withoutMeta<T extends Model>(model: T) {
  if (model.META) {
    model = { ...model };
    delete model.META;
  }
  return model;
}

export function capitalize(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}

export function lowercase(str: string) {
  return str.slice(0, 1).toLowerCase() + str.slice(1);
}

export function stripLeadingSlash(str: string) {
  return str.slice(0, 1) === "/" ? str.slice(1) : str;
}
