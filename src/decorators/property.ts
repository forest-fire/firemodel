import "reflect-metadata";
import { IDictionary, PropertyDecorator } from "common-types";
import { propertyDecorator, propertiesByModel } from "./decorator";
import { propertyReflector } from "./reflector";
import { IModelMetaProperties, IModelPropertyMeta } from "./schema";

export function constrainedProperty(options: IDictionary = {}) {
  return propertyReflector<IModelPropertyMeta>(
    {
      ...options,
      ...{ isRelationship: false, isProperty: true }
    },
    propertiesByModel
  );
}

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: any) {
  return propertyReflector<IModelPropertyMeta>(
    { [prop]: value },
    propertiesByModel
  );
}

export function desc(value: string) {
  return propertyReflector<IModelPropertyMeta>(
    { desc: value },
    propertiesByModel
  );
}

export function min(value: number) {
  return propertyReflector<IModelPropertyMeta>(
    { min: value },
    propertiesByModel
  );
}

export type MockFunction = (context: import("firemock").MockHelper) => any;

export function mock(value: string | MockFunction) {
  return propertyReflector<IModelPropertyMeta>(
    { mockType: value },
    propertiesByModel
  );
}

export function max(value: number) {
  return propertyReflector<IModelPropertyMeta>(
    { max: value },
    propertiesByModel
  );
}

export function length(value: number) {
  return propertyReflector<IModelPropertyMeta>(
    { length: value },
    propertiesByModel
  );
}

export const property = propertyReflector(
  {
    isRelationship: false,
    isProperty: true
  },
  propertiesByModel
);

export const pushKey = propertyReflector({ pushKey: true }, propertiesByModel);
