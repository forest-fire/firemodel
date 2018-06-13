import "reflect-metadata";
import { PropertyDecorator } from "common-types";
import { propertyDecorator } from "./decorator";

export function hasMany(schemaClass: new () => any) {
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany",
      fkConstructor: schemaClass
    },
    "property"
  ) as PropertyDecorator;
}

export function ownedBy(schemaClass: new () => any) {
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "ownedBy",
      fkConstructor: schemaClass
    },
    "property"
  ) as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return propertyDecorator({ inverseProperty });
}
