import "reflect-metadata";

import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "@types";
import {
  addPropertyToModelMeta,
  addRelationshipToModelMeta,
  getProperties,
} from "@decorators";

import { IDictionary } from "common-types";
import { Model } from "@/core";

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
      ...nameValuePairs,
    };
    Reflect.defineMetadata(key, meta, target);
    addPropertyToModelMeta<T>(target.constructor.name, property, meta);
  }

  if (nameValuePairs.isRelationship) {
    const meta: IFmModelRelationshipMeta<T> = {
      ...Reflect.getMetadata(key, target),
      ...{ type: reflect.name },
      ...nameValuePairs,
    };
    Reflect.defineMetadata(key, meta, target);
    addRelationshipToModelMeta(target.constructor.name, property, meta);
  }
};

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter((p) => p.pushKey).map((p) => p.property);
}
