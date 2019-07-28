import { IDictionary } from "common-types";
/**
 * the normal call signature of a **Redux** `dispatch()` call
 */
export declare type IReduxDispatch<T extends IReduxAction = IReduxAction, O = any> = (payload: T) => Promise<O>;
/**
 * The structure of a Redux action message (aka, a dictionary with
 * at least the `type` attribute)
 */
export interface IReduxAction extends IDictionary {
    type: string;
}
