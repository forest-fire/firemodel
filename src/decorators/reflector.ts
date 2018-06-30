import { Model } from "../Model";
import { IDictionary } from "common-types";
import { IModelPropertyMeta, model } from "./schema";
import { set, get } from "lodash";

function push<T extends Model = Model>(
  target: IDictionary,
  path: string,
  value: T
) {
  if (Array.isArray(get(target, path))) {
    get(target, path).push(value);
  } else {
    set(target, path, [value]);
  }
}

export const propertyReflector = <R>(
  context: IDictionary = {},
  /** if you want this to be rollup up as an array; to be exposed in the model (or otherwise) */
  modelRollup?: IDictionary<R[]>
) => (target: Model, key: string): void => {
  const modelName = target.constructor.name;

  // const reflect: IDictionary =
  //   Reflect.getMetadata("design:type", target, key) || {};
  const meta: R = {
    ...Reflect.getMetadata(key, target),
    ...context,
    property: key
  };

  Reflect.defineMetadata(key, meta, target);

  if (modelRollup) {
    push<R>(modelRollup, modelName, meta);
  }
};
