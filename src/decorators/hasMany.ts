import { Record } from "../Record";
import { IDictionary, Omit } from "common-types";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { IFmModelRelationshipMeta } from "./types";

export type IFmHasMany<T = true> = IDictionary<T>;

export function hasMany(
  fnToModelConstructor: () => new () => any,
  inverse?: string
) {
  const payload: Omit<IFmModelRelationshipMeta, "type" | "property"> = {
    isRelationship: true,
    isProperty: false,
    relType: "hasMany",
    fkConstructor: fnToModelConstructor
  };
  if (inverse) {
    payload.inverseProperty = inverse;
  }

  return propertyReflector(
    { ...payload, type: "Object" },
    relationshipsByModel
  );
}
