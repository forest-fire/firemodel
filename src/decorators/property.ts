import "reflect-metadata";
import { IDictionary, PropertyDecorator } from "common-types";
import { propertyDecorator } from "./decorator";

export function constrainedProperty(options: IDictionary = {}) {
  return propertyDecorator(
    {
      ...options,
      ...{ isRelationship: false, isProperty: true }
    },
    "property"
  ) as PropertyDecorator;
}

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: any) {
  return propertyDecorator({ [prop]: value }) as PropertyDecorator;
}

export function desc(value: string) {
  return propertyDecorator({ desc: value }) as PropertyDecorator;
}

export function min(value: number) {
  return propertyDecorator({ min: value });
}

export type MockFunction = (context: import("firemock").MockHelper) => any;

export function mock(value: string | MockFunction) {
  return propertyDecorator({ mockType: value });
}

export function max(value: number) {
  return propertyDecorator({ max: value });
}

export function length(value: number) {
  return propertyDecorator({ length: value });
}

export const property = propertyDecorator(
  {
    isRelationship: false,
    isProperty: true
  },
  "property"
) as PropertyDecorator;

export const pushKey = propertyDecorator(
  {
    pushKey: true
  },
  "property"
) as PropertyDecorator;
