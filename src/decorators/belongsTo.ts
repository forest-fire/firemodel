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
  try {
    const payload: Omit<
      IFmModelRelationshipMeta,
      "type" | "property"
    > = {
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
