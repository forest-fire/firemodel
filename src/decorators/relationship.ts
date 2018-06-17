import "reflect-metadata";
import { PropertyDecorator } from "common-types";
import { propertyDecorator } from "./decorator";
import { Model, Record } from "../index";

export function hasMany(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany",
      fkConstructor: modelConstructor,
      fkModelName: rec.modelName
    },
    "property"
  ) as PropertyDecorator;
}

export function ownedBy(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "ownedBy",
      fkConstructor: modelConstructor,
      fkModelName: rec.modelName
    },
    "property"
  ) as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return propertyDecorator({ inverseProperty });
}
