import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { Record } from "../Record";

export function hasMany(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  const payload = {
    isRelationship: true,
    isProperty: false,
    relType: "hasMany",
    fkConstructor: modelConstructor,
    fkModelName: rec ? rec.modelName : null
  };

  console.log(
    `registering hasMany:`,
    payload,
    rec.META ? rec.META : "self-reference: "
  );

  return propertyDecorator(payload, "property") as PropertyDecorator;
}

export function ownedBy(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  const payload = {
    isRelationship: true,
    isProperty: false,
    relType: "ownedBy",
    fkConstructor: modelConstructor,
    fkModelName: rec.modelName
  };

  console.log(`registering ownedBy: `, payload, rec.META);

  return propertyDecorator(payload, "property") as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return propertyDecorator({ inverseProperty });
}
