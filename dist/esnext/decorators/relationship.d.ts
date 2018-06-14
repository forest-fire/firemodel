import "reflect-metadata";
import { PropertyDecorator } from "common-types";
export declare function hasMany(schemaClass: new () => any): PropertyDecorator;
export declare function ownedBy(schemaClass: new () => any): PropertyDecorator;
export declare function inverse(inverseProperty: string): (target: import("../model").Model, key: string) => void;
