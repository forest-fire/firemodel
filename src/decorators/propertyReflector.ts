import "reflect-metadata";

import { get, lowercase, set } from "@/util";

import { IDictionary } from "common-types";
import { IModel } from "@/types";

/**
 * Adds meta data to a given "property" on a model. In this
 * case we mean property to be either a strict property or
 * a relationship.
 *
 * @param context The meta information as a dictionary/hash
 * @param modelRollup a collection object which maintains
 * a dictionary of properties
 */
export const propertyReflector = <R>(
  context: IDictionary = {},
  /**
   * if you want this to be rollup up as an dictionary by prop;
   * to be exposed in the model (or otherwise)
   */
  modelRollup?: IDictionary<IDictionary<R>>
) => (modelKlass: IModel, key: string): void => {
  const modelName = modelKlass.constructor.name;

  const reflect: IDictionary =
    Reflect.getMetadata("design:type", modelKlass, key) || {};

  const meta: IDictionary = {
    ...(Reflect.getMetadata(key, modelKlass) || {}),
    type: lowercase(reflect.name) as string,
    ...context,
    property: key,
  };

  Reflect.defineMetadata(key, meta, modelKlass);

  if (modelRollup) {
    const modelAndProp = modelName + "." + key;

    set(modelRollup, modelAndProp, {
      ...get(modelRollup, modelAndProp),
      ...meta,
    });
  }
};
