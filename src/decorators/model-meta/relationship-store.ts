import { IDictionary } from "common-types";
import { Model } from "../../Model";
import { hashToArray } from "typed-conversions";
import { IFmModelRelationshipMeta } from "../types";

export const relationshipsByModel: IDictionary<
  IDictionary<IFmModelRelationshipMeta>
> = {};

/** allows the addition of meta information to be added to a model's relationships */
export function addRelationshipToModelMeta<T extends Model = Model>(
  modelName: string,
  property: string,
  meta: IFmModelRelationshipMeta<T>
) {
  if (!relationshipsByModel[modelName]) {
    relationshipsByModel[modelName] = {};
  }
  // TODO: investigate why we need to genericize to model (from <T>)
  relationshipsByModel[modelName][property] = meta as IFmModelRelationshipMeta<
    Model
  >;
}

export function isRelationship(modelKlass: IDictionary) {
  return (prop: string) => {
    return getModelRelationship(modelKlass)(prop) ? true : false;
  };
}

export function getModelRelationship<T extends Model>(model: T) {
  const relnsForModel = getRelationships(model);
  const className = model.constructor.name;

  return (prop: string) => {
    return relnsForModel.find(value => {
      return value.property === prop;
    });
  };
}

/**
 * Gets all the relationships for a given model
 */
export function getRelationships(model: object) {
  const modelName = model.constructor.name;
  const properties =
    hashToArray(relationshipsByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(relationshipsByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties;
}
