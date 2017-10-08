import 'reflect-metadata';
import { BaseSchema, RelationshipPolicy } from '../base-schema';
import { IDictionary, PropertyDecorator } from 'common-types';
import { decorator } from './decorator';

export function constrainedProperty(options: IDictionary = {}) {
  return decorator(options) as PropertyDecorator;
}

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: any) {
  return decorator({[prop]: value}) as PropertyDecorator;
}

export function desc(value: string) {
  return decorator({desc: value}) as PropertyDecorator;
}

export function min(value: number) {
  return decorator({min: value});
}

export function max(value: number) {
  return decorator({max: value});
}

export function length(value: number) {
  return decorator({length: value});
}

export const property = decorator({
  isRelationship: false,
  isProperty: true
}) as PropertyDecorator;
