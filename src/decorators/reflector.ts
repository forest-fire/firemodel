import { Model } from "../Model";
import { IDictionary } from "common-types";
import { IModelPropertyMeta, model } from "./schema";
import { set, get } from "lodash";
import { pathJoin } from "../path";

export interface IHasPropertyAndType {
  property: string;
  type: string;
  [key: string]: any;
}

function push<T extends IHasPropertyAndType>(
  target: IDictionary,
  path: string,
  value: T
) {
  set(target, path, value);
}

export const propertyReflector = <R>(
  context: IDictionary = {},
  /** if you want this to be rollup up as an dictionary by prop; to be exposed in the model (or otherwise) */
  modelRollup?: IDictionary<IDictionary<R>>
) => (modelKlass: Model, key: string): void => {
  const modelName = modelKlass.constructor.name;

  const reflect: IDictionary =
    Reflect.getMetadata("design:type", modelKlass, key) || {};
  const meta: IDictionary = {
    ...context,
    type: reflect.name as string,
    ...Reflect.getMetadata(key, modelKlass),
    property: key
  };

  Reflect.defineMetadata(key, meta, modelKlass);

  if (modelRollup) {
    const modelAndProp = modelName + "." + key;
    set(modelRollup, modelAndProp, {
      ...get(modelRollup, modelAndProp),
      ...meta
    });
  }
};
