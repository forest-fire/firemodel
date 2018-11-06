import "reflect-metadata";
import {
  propertyDecorator,
  propertiesByModel,
  relationshipsByModel
} from "./decorator";
import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
import { IDictionary } from "common-types";
import { propertyReflector } from "./reflector";
import { IModelRelationshipMeta } from "./schema";
import { Model } from "../Model";

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

  return propertyReflector(payload, relationshipsByModel);
}

export function belongsTo<T = Model>(modelConstructor: new () => T) {
  return ownedBy(modelConstructor);
}

export function ownedBy<T = Model>(modelConstructor: new () => T) {
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

  return propertyReflector(payload, relationshipsByModel);
}

export function inverse(inverseProperty: string) {
  return propertyReflector<IModelRelationshipMeta>(
    { inverseProperty },
    relationshipsByModel
  );
}
