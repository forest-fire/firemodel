import "reflect-metadata";
import { Model, ISchemaMetaProperties, ISchemaRelationshipMetaProperties } from "..";
import { IDictionary } from "common-types";
export declare const propertyDecorator: (nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
/**
 * Give all properties from schema and base schema
 *
 * @param target the schema object which is being looked up
 */
export declare function getProperties(target: object): ISchemaMetaProperties[];
export declare function getRelationships(target: object): ISchemaRelationshipMetaProperties[];
export declare function getPushKeys(target: object): any[];
