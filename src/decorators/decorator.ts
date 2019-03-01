import "reflect-metadata";
import { Model } from "../Model";
import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./index";
import { IDictionary } from "common-types";
import { set, get } from "lodash";
import { hashToArray } from "typed-conversions";

function push<T extends Model = Model>(
  target: IDictionary,
  path: string,
  value: IFmModelPropertyMeta<T>
) {
  if (Array.isArray(get(target, path))) {
    get(target, path).push(value);
  } else {
    set(target, path, [value]);
  }
}

/** Properties accumlated by propertyDecorators  */
export const propertiesByModel: IDictionary<
  IDictionary<IFmModelPropertyMeta>
> = {};
/** Relationships accumlated by hasMany/hasOne decorators */
export const relationshipsByModel: IDictionary<
  IDictionary<IFmModelRelationshipMeta>
> = {};

export const propertyDecorator = <T extends Model>(
  nameValuePairs: IDictionary = {},
  /**
   * if you want to set the property being decorated's name
   * as property on meta specify the meta properties name here
   */
  property?: string
) => (target: Model, key: string): void => {
  const reflect: IDictionary =
    Reflect.getMetadata("design:type", target, key) || {};
  const meta: IFmModelPropertyMeta<T> = {
    ...Reflect.getMetadata(key, target),
    ...{ type: reflect.name },
    ...nameValuePairs
  };

  Reflect.defineMetadata(key, meta, target);

  if (nameValuePairs.isProperty) {
    if (property) {
      push(propertiesByModel, target.constructor.name, {
        ...meta,
        [property]: key
      });
    } else {
      push(propertiesByModel, target.constructor.name, meta);
    }
  }
  if (nameValuePairs.isRelationship) {
    if (property) {
      push(relationshipsByModel, target.constructor.name, {
        ...meta,
        [property]: key
      });
    } else {
      push(relationshipsByModel, target.constructor.name, meta);
    }
  }
};

/** lookup meta data for schema properties */
function propertyMeta<T extends Model = Model>(context: object) {
  return (prop: string): IFmModelPropertyMeta<T> =>
    Reflect.getMetadata(prop, context);
}

/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export function getProperties<T extends Model>(model: T) {
  const modelName = model.constructor.name;
  const properties =
    hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(propertiesByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  // return [...subClass, ...baseModel];
  return properties;
}

/**
 * Gets all the relationships for a given model
 */
export function getRelationships(model: object) {
  const modelName = model.constructor.name;
  const modelRelationships = relationshipsByModel[modelName];
  return hashToArray<IFmModelRelationshipMeta>(modelRelationships, "property");
}

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter(p => p.pushKey).map(p => p.property);
}
