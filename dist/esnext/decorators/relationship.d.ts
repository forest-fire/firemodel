import "reflect-metadata";
import { Model } from "../model";
import { PropertyDecorator } from "common-types";
export declare function hasMany(schemaClass: new () => any): PropertyDecorator;
export declare function ownedBy(schemaClass: new () => any): PropertyDecorator;
export declare function inverse(inverseProperty: string): (target: Model, key: string) => void;
