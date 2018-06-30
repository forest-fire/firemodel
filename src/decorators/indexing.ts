import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { IDictionary, PropertyDecorator } from "common-types";
import { propertyReflector } from "./reflector";

export interface IModelIndexMeta {
  isIndex: boolean;
  isUniqueIndex: boolean;
  desc?: string;
  property: string;
}

/** DB Indexes accumlated by index decorators */
export const indexesForModel: IDictionary<IModelIndexMeta[]> = {};

/**
 * Gets all the db indexes for a given model
 */
export function getDbIndexes<T>(target: object): IModelIndexMeta[] {
  const modelName = target.constructor.name;
  return modelName === "Model"
    ? indexesForModel[modelName] || []
    : (indexesForModel[modelName] || []).concat(indexesForModel.Model);
}

export const index = propertyReflector<IModelIndexMeta>(
  {
    isIndex: true,
    isUniqueIndex: false
  },
  indexesForModel
);

export const uniqueIndex = propertyReflector<IModelIndexMeta>(
  {
    isIndex: true,
    isUniqueIndex: true
  },
  indexesForModel
);
