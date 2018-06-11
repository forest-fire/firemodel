import "reflect-metadata";
import { BaseSchema } from "../base-schema";
import { IDictionary, PropertyDecorator } from "common-types";
export declare function constrainedProperty(options?: IDictionary): PropertyDecorator;
/** allows the introduction of a new constraint to the metadata of a property */
export declare function constrain(prop: string, value: any): PropertyDecorator;
export declare function desc(value: string): PropertyDecorator;
export declare function min(value: number): (target: BaseSchema, key: string) => void;
export declare function max(value: number): (target: BaseSchema, key: string) => void;
export declare function length(value: number): (target: BaseSchema, key: string) => void;
export declare const property: PropertyDecorator;
export declare const pushKey: PropertyDecorator;
