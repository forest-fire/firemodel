import "reflect-metadata";
import { Model, ISchemaMetaProperties, ISchemaRelationshipMetaProperties } from "..";
import { IDictionary } from "common-types";
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
/**
 * Give all properties from schema and base schema
 *
 * @param target the schema object which is being looked up
 */
export declare function getProperties(target: object): ISchemaMetaProperties<Model>[];
export declare function getRelationships<T>(target: object): ISchemaRelationshipMetaProperties<T>[];
export declare function getPushKeys(target: object): ("META" | "id" | "lastUpdated" | "createdAt")[];
