import { Model } from "../Model";
import { Record } from "../Record";
import { addModelMeta } from "../ModelMeta";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
import { IFmModelRelationshipMeta } from "./schema";
import { Omit } from "common-types";

export type IFmHasOne = string;

export function belongsTo<T = Model>(
  fnToModelConstructor: () => new () => T,
  inverse?: string
) {
  const modelConstructor = fnToModelConstructor();
  const model = new modelConstructor();
  const record = Record.create(modelConstructor);
  let meta;

  if (record.META) {
    addModelMeta(record.modelName, record.META);
    meta = record.META;
  }
  const payload: Omit<
    IFmModelRelationshipMeta<typeof model>,
    "type" | "property"
  > = {
    isRelationship: true,
    isProperty: false,
    relType: "hasOne",
    fkConstructor: modelConstructor,
    fkModelName: record.modelName,
    fkPluralName: record.pluralName
  };
  if (inverse) {
    payload.inverseProperty = inverse;
  }

  return propertyReflector(payload, relationshipsByModel);
}

export const ownedBy = belongsTo;
export const hasOne = belongsTo;
