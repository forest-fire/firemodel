import "reflect-metadata";
import { Model, IModelPropertyMeta, IModelRelationshipMeta } from "../index";
import { IDictionary } from "common-types";
/** Properties accumlated by propertyDecorators  */
export declare const propertiesByModel: IDictionary<IDictionary<IModelPropertyMeta>>;
/** Relationships accumlated by hasMany/ownedBy decorators */
export declare const relationshipsByModel: IDictionary<IDictionary<IModelRelationshipMeta>>;
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
/**
 * Gets all the properties for a given model
 *
 * @param model the schema object which is being looked up
 */
export declare function getProperties(model: object): IModelPropertyMeta<Model>[];
/**
 * Gets all the relationships for a given model
 */
export declare function getRelationships(model: object): IModelRelationshipMeta<Model>[];
export declare function getPushKeys(target: object): ("id" | "lastUpdated" | "createdAt" | "META")[];
