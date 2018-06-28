import "reflect-metadata";
import { Model, IModelPropertyMeta, IModelRelationshipMeta } from "../index";
import { IDictionary } from "common-types";
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
/**
 * Gets all the properties for a given model
 *
 * @param target the schema object which is being looked up
 */
export declare function getProperties(target: object): IModelPropertyMeta<Model>[];
/**
 * Gets all the relationships for a given model
 */
export declare function getRelationships<T>(target: object): IModelRelationshipMeta<T>[];
export declare function getPushKeys(target: object): ("id" | "lastUpdated" | "createdAt" | "META")[];
