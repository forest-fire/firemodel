import 'reflect-metadata';
import { BaseSchema, RelationshipPolicy } from '../base-schema';
import { IDictionary, PropertyDecorator } from 'common-types';

export const decorator = (nameValuePairs: IDictionary = {}) => (target: any, key: string): void => {
  const reflect = Reflect.getMetadata('design:type', target, key);
  Reflect.defineMetadata(
    key,
    {
      ...Reflect.getMetadata(key, target),
      ...{type: reflect.name},
      ...nameValuePairs
    },
    target
  );
  const _val: any = this[key];
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
}
