import { IFmModelPropertyMeta, Model } from "../../private";
import { IDictionary } from "common-types";
export declare function isProperty(modelKlass: IDictionary): (prop: string) => boolean;
/** Properties accumlated by propertyDecorators  */
export declare const propertiesByModel: IDictionary<IDictionary<IFmModelPropertyMeta>>;
/** allows the addition of meta information to be added to a model's properties */
export declare function addPropertyToModelMeta<T extends Model = Model>(modelName: string, property: string, meta: IFmModelPropertyMeta<T>): void;
/** lookup meta data for schema properties */
export declare function getModelProperty<T extends Model = Model>(model: T): (prop: string) => IFmModelPropertyMeta<Model>;
/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export declare function getProperties<T extends Model>(model: T): IFmModelPropertyMeta<Model>[];
