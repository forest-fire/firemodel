import "reflect-metadata";
import { BaseSchema, ISchemaMetaProperties } from "../index";
import { IDictionary } from "common-types";
export declare const propertyDecorator: (nameValuePairs?: IDictionary<any>, property?: string) => (target: BaseSchema, key: string) => void;
export declare function getProperties(target: object): ISchemaMetaProperties[];
export declare function getRelationships(target: object): ISchemaMetaProperties[];
export declare function getPushKeys(target: object): any[];
