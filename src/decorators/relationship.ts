import 'reflect-metadata';
import { BaseSchema, RelationshipPolicy } from '../base-schema';
import { IDictionary, PropertyDecorator } from 'common-types';
import { decorator } from './decorator';

export function hasMany(schemaClass: new () => any) {
  return decorator( {
    isRelationship: true,
    isProperty: false,
    relType: 'hasMany'
  }) as PropertyDecorator;
}

export function ownedBy(schemaClass: new () => any) {
  return decorator({
    isRelationship: true,
    isProperty: false,
    relType: 'ownedBy'
  }) as PropertyDecorator;
}

export function inverse(inverseProperty: string) {
  return decorator({ inverseProperty })
}
