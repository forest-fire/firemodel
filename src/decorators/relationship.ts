import "reflect-metadata";
import { propertyDecorator } from "./decorator";
import { Record } from "../Record";
import { getModelMeta, addModelMeta } from "../ModelMeta";
import { IDictionary } from "../../node_modules/common-types/dist";

export function hasMany(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  let meta: IDictionary = {};
  if (rec.META) {
    addModelMeta(rec.modelName, rec.META);
    meta = rec.META;
  }
  const payload = {
    isRelationship: true,
    isProperty: false,
    relType: "hasMany",
    fkConstructor: modelConstructor,
    fkModelName: rec.modelName,
    fkPluralName: rec.pluralName
  };

  return propertyDecorator(payload, "property") as PropertyDecorator;
}

export function ownedBy(modelConstructor: new () => any) {
  const rec = Record.create(modelConstructor);
  let meta;
  if (rec.META) {
    addModelMeta(rec.modelName, rec.META);
    meta = rec.META;
  }
  const payload = {
    isRelationship: true,
    isProperty: false,
    relType: "ownedBy",
    fkConstructor: modelConstructor,
    fkModelName: rec.modelName
  };

  return propertyDecorator(payload, "property") as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return propertyDecorator({ inverseProperty });
}
