import "reflect-metadata";
import { Model } from "../Model";
import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./index";
import { IDictionary } from "common-types";
import { set, get } from "lodash";
import {
  getProperties,
  addPropertyToModelMeta
} from "./model-meta/property-store";
import { addRelationshipToModelMeta } from "./model-meta/relationship-store";

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

  if (nameValuePairs.isProperty) {
    const meta: IFmModelPropertyMeta<T> = {
      ...Reflect.getMetadata(key, target),
      ...{ type: reflect.name },
      ...nameValuePairs
    };
    Reflect.defineMetadata(key, meta, target);
    addPropertyToModelMeta(target.constructor.name, property, meta);
  }

  if (nameValuePairs.isRelationship) {
    const meta: IFmModelRelationshipMeta<T> = {
      ...Reflect.getMetadata(key, target),
      ...{ type: reflect.name },
      ...nameValuePairs
    };
    Reflect.defineMetadata(key, meta, target);
    addRelationshipToModelMeta(target.constructor.name, property, meta);
  }
};

/** lookup meta data for schema properties */
function propertyMeta<T extends Model = Model>(context: object) {
  return (prop: string): IFmModelPropertyMeta<T> =>
    Reflect.getMetadata(prop, context);
}

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter(p => p.pushKey).map(p => p.property);
}
