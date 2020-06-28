import { IFmModelRelationshipMeta, IModel } from "../../@types/index";
import { IDictionary } from "common-types";
export declare const relationshipsByModel: IDictionary<IDictionary<IFmModelRelationshipMeta>>;
/** allows the addition of meta information to be added to a IModel's relationships */
export declare function addRelationshipToModelMeta<T extends IModel = IModel>(IModelName: string, property: string, meta: IFmModelRelationshipMeta<T>): void;
export declare function isRelationship(IModelKlass: IDictionary): (prop: string) => boolean;
export declare function getModelRelationship<T extends IModel>(IModel: T): (prop: string) => IFmModelRelationshipMeta<IModel>;
/**
 * Gets all the relationships for a given IModel
 */
export declare function getRelationships(IModel: object): IFmModelRelationshipMeta<IModel>[];
