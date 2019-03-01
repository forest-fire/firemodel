import "reflect-metadata";
import { IDictionary } from "common-types";
import { propertyReflector } from "./reflector";
import NamedFakes from "../Mock/NamedFakes";
import { propertiesByModel } from "./model-meta/property-store";
import { IFmModelPropertyMeta, FmMockType } from "./types";

export function constrainedProperty(options: IDictionary = {}) {
  return propertyReflector<IFmModelPropertyMeta>(
    {
      ...options,
      ...{ isRelationship: false, isProperty: true }
    },
    propertiesByModel
  );
}

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: any) {
  return propertyReflector<IFmModelPropertyMeta>(
    { [prop]: value },
    propertiesByModel
  );
}

export function desc(value: string) {
  return propertyReflector<IFmModelPropertyMeta>(
    { desc: value },
    propertiesByModel
  );
}

export function min(value: number) {
  return propertyReflector<IFmModelPropertyMeta>(
    { min: value },
    propertiesByModel
  );
}

export function mock(value: FmMockType, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}

export function max(value: number) {
  return propertyReflector<IFmModelPropertyMeta>(
    { max: value },
    propertiesByModel
  );
}

export function length(value: number) {
  return propertyReflector<IFmModelPropertyMeta>(
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
