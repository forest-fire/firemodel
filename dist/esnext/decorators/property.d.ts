import "reflect-metadata";
import { Model } from "../Model";
import { IDictionary, PropertyDecorator } from "common-types";
export declare function constrainedProperty(options?: IDictionary): PropertyDecorator;
/** allows the introduction of a new constraint to the metadata of a property */
export declare function constrain(prop: string, value: any): PropertyDecorator;
export declare function desc(value: string): PropertyDecorator;
export declare function min(value: number): (target: Model, key: string) => void;
export declare type MockFunction = (context: import("firemock").MockHelper) => any;
export declare function mock(value: string | MockFunction): (target: Model, key: string) => void;
export declare function max(value: number): (target: Model, key: string) => void;
export declare function length(value: number): (target: Model, key: string) => void;
export declare const property: PropertyDecorator;
export declare const pushKey: PropertyDecorator;
