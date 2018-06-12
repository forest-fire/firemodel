import "reflect-metadata";
import { Model, RelationshipPolicy } from "../Model";
import { IDictionary, PropertyDecorator } from "common-types";
import { propertyDecorator } from "./decorator";

export function hasMany(schemaClass: new () => any) {
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany"
    },
    "property"
  ) as PropertyDecorator;
}

export function ownedBy(schemaClass: new () => any) {
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "ownedBy"
    },
    "property"
  ) as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return propertyDecorator({ inverseProperty });
}
