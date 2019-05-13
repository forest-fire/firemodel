import { Record } from "../Record";
import { IDictionary, Omit } from "common-types";
import { propertyReflector } from "./reflector";
import { relationshipsByModel } from "./model-meta/relationship-store";
import {
  IFmModelRelationshipMeta,
  IFmFunctionToConstructor,
  IFmRelationshipDirectionality
} from "./types";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";

export type IFmHasMany<T = true> = IDictionary<T>;

export function hasMany(
  fnToModelConstructor: IFmFunctionToConstructor,
  inverse?: string | [string, IFmRelationshipDirectionality]
) {
  try {
    let inverseProperty: string | null;
    let directionality: IFmRelationshipDirectionality;
    if (Array.isArray(inverse)) {
      [inverseProperty, directionality] = inverse;
    } else {
      inverseProperty = inverse;
      directionality = inverse ? "bi-directional" : "one-way";
    }
    const payload: Omit<IFmModelRelationshipMeta, "type" | "property"> = {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany",
      directionality,
      fkConstructor: fnToModelConstructor
    };
    if (inverseProperty) {
      payload.inverseProperty = inverseProperty;
    }

    return propertyReflector(
      { ...payload, type: "Object" },
      relationshipsByModel
    );
  } catch (e) {
    throw new DecoratorProblem("hasMany", e, { inverse });
  }
}
