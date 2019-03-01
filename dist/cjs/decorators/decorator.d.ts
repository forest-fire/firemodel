import "reflect-metadata";
import { Model } from "../";
import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./index";
import { IDictionary } from "common-types";
/** Properties accumlated by propertyDecorators  */
export declare const propertiesByModel: IDictionary<IDictionary<IFmModelPropertyMeta>>;
/** Relationships accumlated by hasMany/hasOne decorators */
export declare const relationshipsByModel: IDictionary<IDictionary<IFmModelRelationshipMeta>>;
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
/**
 * Gets all the properties for a given model
 *
 * @param model the schema object which is being looked up
 */
export declare function getProperties(model: object): any[];
/**
 * Gets all the relationships for a given model
 */
export declare function getRelationships(model: object): IFmModelRelationshipMeta<Model>[];
export declare function getPushKeys(target: object): any[];
