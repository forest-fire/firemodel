import { Model } from "../Model";
import { IFmRelationshipDirectionality } from "./types";
import { IFnToModelConstructor, IModelConstructor } from "../record/relationships/modelRegistration";
export declare function belongsTo(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class.
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass: IFnToModelConstructor | IModelConstructor | string, inverse?: string | [string, IFmRelationshipDirectionality]): (modelKlass: Model, key: string) => void;
export declare const ownedBy: typeof belongsTo;
export declare const hasOne: typeof belongsTo;
