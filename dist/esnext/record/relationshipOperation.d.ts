import { IFmRelationshipOperation, IFmRelationshipOptions } from "../@types";
import { Record } from "../Record";
import { Model } from "../Model";
import { FMEvents, IFmPathValuePair, IFmRelationshipOptionsForHasMany } from "..";
import { IDictionary } from "common-types";
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers where ever possible
 */
export declare function relationshipOperation<T extends Model>(rec: Record<T>, 
/**
 * **operation**
 *
 * The relationship operation that is being executed
 */
operation: IFmRelationshipOperation, 
/**
 * **property**
 *
 * The property on this model which changing its relationship status in some way
 */
property: keyof T, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths: IFmPathValuePair[], options?: IFmRelationshipOptions | IFmRelationshipOptionsForHasMany): Promise<void>;
export declare function localRelnOp<T extends Model>(rec: Record<T>, op: IFmRelationshipOperation, prop: keyof T, paths: IFmPathValuePair[], event: FMEvents): Promise<void>;
export declare function relnConfirmation<T extends Model>(rec: Record<T>, op: IFmRelationshipOperation, prop: keyof T, paths: IDictionary, event: FMEvents): Promise<void>;
export declare function relnRollback<T extends Model>(rec: Record<T>, op: IFmRelationshipOperation, prop: keyof T, paths: IDictionary, event: FMEvents, err: Error): Promise<void>;
