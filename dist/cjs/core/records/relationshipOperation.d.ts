import { FmEvents, IFkReference, IFmLocalRelationshipEvent, IFmPathValuePair, IFmRelationshipOperation, IFmRelationshipOptions, IFmRelationshipOptionsForHasMany } from "../../types";
import { IModel } from "../../types";
import { Record } from "..";
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
 */
export declare function relationshipOperation<F extends IModel, T extends IModel = IModel>(rec: Record<F>, 
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
property: keyof F & string, 
/**
 * The array of _foreign keys_ (of the "from" model) which will be operated on
 */
fkRefs: Array<IFkReference<T>>, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths: IFmPathValuePair[], options?: IFmRelationshipOptions | IFmRelationshipOptionsForHasMany): Promise<void>;
export declare function localRelnOp<F extends IModel, T extends IModel>(rec: Record<F>, event: Omit<IFmLocalRelationshipEvent<F, T>, "type">, type: FmEvents): Promise<void>;
export declare function relnConfirmation<F extends IModel, T extends IModel>(rec: Record<F>, event: Omit<IFmLocalRelationshipEvent<F, T>, "type">, type: FmEvents): Promise<void>;
export declare function relnRollback<F extends IModel, T extends IModel>(rec: Record<F>, event: Omit<IFmLocalRelationshipEvent<F, T>, "type">, type: FmEvents): Promise<void>;
