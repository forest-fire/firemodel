import { Model } from "../Model";
import { propertyReflector } from "./reflector";
import { Omit } from "common-types";
import { relationshipsByModel } from "./model-meta/relationship-store";
import { IFmModelRelationshipMeta } from "./types";

export function belongsTo<T = Model>(
  fnToModelConstructor: () => new () => T,
  inverse?: string
) {
  try {
    const payload: Omit<IFmModelRelationshipMeta, "type" | "property"> = {
      isRelationship: true,
      isProperty: false,
      relType: "hasOne",
      fkConstructor: fnToModelConstructor
    };
    if (inverse) {
      payload.inverseProperty = inverse;
    }

    return propertyReflector(payload, relationshipsByModel);
  } catch (e) {
    e.name =
      e.name +
      `. The type passed into the decorator was ${typeof fnToModelConstructor} [should be function]`;
    throw e;
  }
}

export const ownedBy = belongsTo;
export const hasOne = belongsTo;
