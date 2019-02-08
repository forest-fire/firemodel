import { Record } from "../Record";
import { IDictionary, Omit } from "common-types";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./decorator";
import { IFmModelRelationshipMeta } from "./schema";

export type IFmHasMany = IDictionary<string>;

export function hasMany(
  fnToModelConstructor: () => new () => any,
  inverse?: string
) {
  const payload: Omit<IFmModelRelationshipMeta, "type" | "property"> = {
    isRelationship: true,
    isProperty: false,
    relType: "hasMany",
    fkConstructor: fnToModelConstructor,
  };
  if (inverse) {
    payload.inverseProperty = inverse;
  }

  return propertyReflector(payload, relationshipsByModel);
}
