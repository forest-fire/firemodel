import { IFmRelationshipDirectionality, IFnToModelConstructor, IModelConstructor } from "../private";
import { IDictionary } from "common-types";
export declare type IFmHasMany<T = true> = IDictionary<T>;
export declare function hasMany(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass: IFnToModelConstructor | IModelConstructor | string, inverse?: string | [string, IFmRelationshipDirectionality]): (modelKlass: import("../private").Model, key: string) => void;
