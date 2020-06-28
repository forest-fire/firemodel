import {
  IFmModelRelationshipMeta,
  IFmRelationshipDirectionality,
  IFnToModelConstructor,
  IModelConstructor,
} from "@/types";
import {
  modelConstructorLookup,
  modelNameLookup,
  relationshipsByModel,
} from "@/util";

import { DecoratorProblem } from "@/errors";
import { Omit } from "common-types";
import { propertyReflector } from "@/decorators";

export function belongsTo(
  /**
   * either a _string_ representing the Model's class name
   * or a _constructor_ for the Model class.
   *
   * In order to support prior implementations we include the
   * possibility that a user of this API will pass in a _function_
   * to a _constructor_. This approach is now deprecated.
   */
  fkClass: IFnToModelConstructor | IModelConstructor | string,
  inverse?: string | [string, IFmRelationshipDirectionality]
) {
  try {
    const fkConstructor: IFnToModelConstructor =
      typeof fkClass === "string"
        ? modelNameLookup(fkClass)
        : modelConstructorLookup(fkClass);

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
      fkConstructor,
      inverseProperty,
      hasInverse: inverseProperty !== undefined ? true : false,
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
