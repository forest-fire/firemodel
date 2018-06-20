import "reflect-metadata";
import { Model, IModelPropertyMeta, IModelRelationshipMeta } from "..";
import { IDictionary } from "common-types";
import { set, get } from "lodash";

function push<T extends Model = Model>(
  target: IDictionary,
  path: string,
  value: IModelPropertyMeta<T>
) {
  if (Array.isArray(get(target, path))) {
    get(target, path).push(value);
  } else {
    set(target, path, [value]);
  }
}

/** Properties accumlated by propertyDecorators  */
const propertiesByModel: IDictionary<IModelPropertyMeta[]> = {};
/** Relationships accumlated by hasMany/ownedBy decorators */
const relationshipsByModel: IDictionary<IModelPropertyMeta[]> = {};

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
  const meta: IModelPropertyMeta<T> = {
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
  return (prop: string): IModelPropertyMeta<T> =>
    Reflect.getMetadata(prop, context);
}

/**
 * Gets all the properties for a given model
 *
 * @param target the schema object which is being looked up
 */
export function getProperties(target: object) {
  return [
    ...propertiesByModel[target.constructor.name],
    ...propertiesByModel.Model.map(s => ({
      ...s,
      ...{ isBaseSchema: true }
    }))
  ];
}

/**
 * Gets all the relationships for a given model
 */
export function getRelationships<T>(target: object) {
  return relationshipsByModel[target.constructor.name] as Array<
    IModelRelationshipMeta<T>
  >;
}

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter(p => p.pushKey).map(p => p.property);
}
