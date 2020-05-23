import { IDictionary, Omit } from "common-types";

import {
  modelNameLookup,
  modelConstructorLookup,
  propertyReflector,
  relationshipsByModel,
  IModelConstructor,
  IFnToModelConstructor,
  DecoratorProblem,
  IFmModelRelationshipMeta,
  IFmRelationshipDirectionality,
} from "@/private";

export type IFmHasMany<T = true> = IDictionary<T>;

export function hasMany(
  /**
   * either a _string_ representing the Model's class name
   * or a _constructor_ for the Model class
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
      relType: "hasMany",
      directionality,
      fkConstructor,
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
