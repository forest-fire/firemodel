import { IDictionary } from "common-types";
import { IFmModelRelationshipMeta } from "../../@types/index";
import { Model } from "../../private";
export declare const relationshipsByModel: IDictionary<IDictionary<IFmModelRelationshipMeta>>;
/** allows the addition of meta information to be added to a model's relationships */
export declare function addRelationshipToModelMeta<T extends Model = Model>(modelName: string, property: string, meta: IFmModelRelationshipMeta<T>): void;
export declare function isRelationship(modelKlass: IDictionary): (prop: string) => boolean;
export declare function getModelRelationship<T extends Model>(model: T): (prop: string) => IFmModelRelationshipMeta<Model>;
/**
 * Gets all the relationships for a given model
 */
export declare function getRelationships(model: object): IFmModelRelationshipMeta<Model>[];
