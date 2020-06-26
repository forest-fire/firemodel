import { FmEvents } from "@/private";
import { IDictionary } from "common-types";

export type Extractable<T, U> = T extends U ? any : never;
export type NotString<T> = string extends T ? never : any;
function promoteStringToFMEvents<
  K extends string & NotString<K> & Extractable<FmEvents, K>
>(k: K): Extract<FmEvents, K> {
  return k;
}
export type IFmCrudOperation = "add" | "update" | "remove";
export const enum IFmCrudOperations {
  add = "add",
  update = "update",
  remove = "remove",
}
export type IFMEventName<T> = string & NotString<T> & Extractable<FmEvents, T>;
export interface IFmDispatchOptions {
  silent?: boolean;
  silentAcceptance?: boolean;
}

/**
 * the normal call signature of a **Redux** `dispatch()` call
 */
export type IReduxDispatch<T extends IReduxAction = IReduxAction, O = any> = (
  payload: T
) => Promise<O>;

/**
 * The structure of a Redux action message (aka, a dictionary with
 * at least the `type` attribute)
 */
export interface IReduxAction extends IDictionary {
  type: string;
}
