import { IDictionary } from "common-types";
import { IFmLocalEvent } from "./watchers/types";
import { IFMEventName } from "./state-mgmt";

/**
 * The Vuex equivalent of a Redux dispatch call
 */
export type IVuexDispatch<I = IFmLocalEvent<any>, O = any> = (
  type: string,
  payload: Omit<I, "type">
) => Promise<O>;

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

/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export function VeuxWrapper<O = any>(
  vuexDispatch: IVuexDispatch<IReduxAction, O>
) {
  /** vuex wrapped redux dispatch function */
  return async (reduxAction: IReduxAction) => {
    const type = reduxAction.type;
    delete reduxAction.type;
    return vuexDispatch(type, reduxAction);
  };
}
