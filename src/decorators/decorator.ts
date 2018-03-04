import "reflect-metadata";
import { BaseSchema, RelationshipPolicy, ISchemaMetaProperties } from "../index";
import { IDictionary, PropertyDecorator, ClassDecorator, ReflectionProperty } from "common-types";
import set = require("lodash.set");
import get = require("lodash.get");

function push(target: IDictionary, path: string, value: ISchemaMetaProperties) {
  if (Array.isArray(get(target, path))) {
    get(target, path).push(value);
  } else {
    set(target, path, [value]);
  }
}

/** Properties accumlated by propertyDecorators and grouped by schema */
const propertiesBySchema: IDictionary<ISchemaMetaProperties[]> = {};
/** Relationships accumlated by propertyDecorators and grouped by schema */
const relationshipsBySchema: IDictionary<ISchemaMetaProperties[]> = {};

export const propertyDecorator = (
  nameValuePairs: IDictionary = {},
  /**
   * if you want to set the property being decorated's name
   * as property on meta specify the meta properties name here
   */
  property?: string
) => (target: BaseSchema, key: string): void => {
  const reflect = Reflect.getMetadata("design:type", target, key);
  const meta: ISchemaMetaProperties = {
    ...Reflect.getMetadata(key, target),
    ...{ type: reflect.name },
    ...nameValuePairs
  };

  Reflect.defineMetadata(key, meta, target);
  const _val: any = this[key];

  if (nameValuePairs.isProperty) {
    if (property) {
      push(propertiesBySchema, target.constructor.name, {
        ...meta,
        [property]: key
      });
    } else {
      push(propertiesBySchema, target.constructor.name, meta);
    }
  }
  if (nameValuePairs.isRelationship) {
    if (property) {
      push(relationshipsBySchema, target.constructor.name, {
        ...meta,
        [property]: key
      });
    } else {
      push(relationshipsBySchema, target.constructor.name, meta);
    }
  }

  Reflect.defineProperty(target, key, {
    get: () => {
      return this[key];
    },
    set: (value: any) => {
      this[key] = value;
    },
    enumerable: true,
    configurable: true
  });
};

/** lookup meta data for schema properties */
function propertyMeta(context: object) {
  return (prop: string): ISchemaMetaProperties => Reflect.getMetadata(prop, context);
}

/**
 * Give all properties from schema and base schema
 *
 * @param target the schema object which is being looked up
 */
export function getProperties(target: object) {
  return [
    ...propertiesBySchema[target.constructor.name],
    ...propertiesBySchema.BaseSchema.map(s => ({
      ...s,
      ...{ isBaseSchema: true }
    }))
  ];
}

export function getRelationships(target: object) {
  return relationshipsBySchema[target.constructor.name];
}

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter(p => p.pushKey).map(p => p.property);
}