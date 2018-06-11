import 'reflect-metadata';
import { BaseSchema } from '../base-schema';
import { PropertyDecorator } from 'common-types';
export declare function hasMany(schemaClass: new () => any): PropertyDecorator;
export declare function ownedBy(schemaClass: new () => any): PropertyDecorator;
export declare function inverse(inverseProperty: string): (target: BaseSchema, key: string) => void;
