import { FmEvents } from "../private";
import { IDictionary } from "common-types";
export declare type Extractable<T, U> = T extends U ? any : never;
export declare type NotString<T> = string extends T ? never : any;
export declare type IFmCrudOperation = "add" | "update" | "remove";
export declare const enum IFmCrudOperations {
    add = "add",
    update = "update",
    remove = "remove"
}
export declare type IFMEventName<T> = string & NotString<T> & Extractable<FmEvents, T>;
export interface IFmDispatchOptions {
    silent?: boolean;
    silentAcceptance?: boolean;
}
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
