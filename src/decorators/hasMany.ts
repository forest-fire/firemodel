import { Record } from "../Record";
import { IDictionary, Omit } from "common-types";
import { addModelMeta } from "../ModelMeta";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
import { IFmModelRelationshipMeta } from "./schema";

export function hasMany(
  fnToModelConstructor: () => new () => any,
  inverse?: string
) {
  const modelConstructor = fnToModelConstructor();
  const model = new modelConstructor();
  const record = Record.create(modelConstructor);

  const payload: Omit<IFmModelRelationshipMeta, "type" | "property"> = {
    isRelationship: true,
    isProperty: false,
    relType: "hasMany",
    fkConstructor: fnToModelConstructor(),
    fkModelName: record.modelName,
    fkPluralName: record.pluralName
  };
  if (inverse) {
    payload.inverseProperty = inverse;
  }

  return propertyReflector(payload, relationshipsByModel);
}
