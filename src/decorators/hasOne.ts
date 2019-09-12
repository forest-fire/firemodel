import { Model } from "../Model";
import { propertyReflector } from "./reflector";
import { Omit } from "common-types";
import { relationshipsByModel } from "./model-meta/relationship-store";
import {
  IFmModelRelationshipMeta,
  IFmFunctionToConstructor,
  IFmRelationshipDirectionality
} from "./types";
import { DecoratorProblem } from "../errors/decorators/DecoratorProblem";
import { FireModel } from "../index";

export function belongsTo<T = Model>(
  fnToModelConstructor: IFmFunctionToConstructor | string,
  inverse?: string | [string, IFmRelationshipDirectionality]
) {
  if (typeof fnToModelConstructor === "string") {
    const model = FireModel.lookupModel(fnToModelConstructor);
    fnToModelConstructor = () => model;
  }
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
      relType: "hasOne",
      directionality,
      fkConstructor: fnToModelConstructor
    };
    if (inverseProperty) {
      payload.inverseProperty = inverseProperty;
    }

    return propertyReflector(
      { ...payload, type: "String" },
      relationshipsByModel
    );
  } catch (e) {
    throw new DecoratorProblem("hasOne", e, { inverse });
  }
}

export const ownedBy = belongsTo;
export const hasOne = belongsTo;
