import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { Record } from "../Record";

export function hasMany(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  console.log(rec.modelName);
  console.log(rec.META);

  return propertyDecorator(
    {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany",
      fkConstructor: modelConstructor,
      fkModelName: rec ? rec.modelName : null
    },
    "property"
  ) as PropertyDecorator;
}

export function ownedBy(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  console.log(rec.modelName);

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
