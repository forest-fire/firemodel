import "reflect-metadata";
import { Model } from "../Model";
import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./index";
import { IDictionary } from "common-types";
import { set, get } from "lodash";
import { hashToArray } from "typed-conversions";
import { getProperties, addPropertyToModelMeta } from "./model/property-store";

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
      addPropertyToModelMeta(target.constructor.name, property, meta);
      // push(propertiesByModel, target.constructor.name, {
      //   ...meta,
      //   [property]: key
      // });
    } else {
      // push(propertiesByModel, target.constructor.name, meta);
      addPropertyToModelMeta(target.constructor.name, property, meta);
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
