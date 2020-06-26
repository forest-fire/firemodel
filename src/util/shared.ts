import { IAuditChange } from "@types";
import { IDictionary } from "common-types";
import { Model } from "@/models";
import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "@/decorators/shared";

export function normalized(...args: string[]) {
  return args
    .filter((a) => a)
    .map((a) => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
    .map((a) => a.replace(/\./g, "/"));
}

export function slashNotation(...args: string[]) {
  return normalized(...args).join("/");
}

export function firstKey<T extends IDictionary = IDictionary>(thingy: T) {
  return Object.keys(thingy)[0];
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
        action: propertyAction,
      };
      prev.push(payload);
      return prev;
    },
    []
  );
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

  return properties.map((p) => p.property);
}

export function withoutMetaOrPrivate<T extends Model>(model: T) {
  if (model && model.META) {
    model = { ...model };
    delete model.META;
  }
  if (model) {
    Object.keys((key: keyof T & string) => {
      if (key.slice(0, 1) === "_") {
        delete model[key];
      }
    });
  }
  return model;
}

export function capitalize(str: string) {
  return str ? str.slice(0, 1).toUpperCase() + str.slice(1) : "";
}

export function lowercase(str: string) {
  return str ? str.slice(0, 1).toLowerCase() + str.slice(1) : "";
}

export function stripLeadingSlash(str: string) {
  return str.slice(0, 1) === "/" ? str.slice(1) : str;
}
