import { IDictionary } from "common-types";

/**
 * The Vuex equivalent of a Redux dispatch call
 */
export type IVuexDispatch = (type: string, payload: IDictionary) => void;

/** the normal call signature of a redux dispatch call */
export type IReduxDispatch = (payload: IDictionary) => void;

/**
 * The structure of a Redux action message)
 */
export interface IReduxAction extends IDictionary {
  type: string;
}

/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export function VeuxWrapper(vuexDispatch: IVuexDispatch) {
  /** vuex wrapped redux dispatch function */
  return (reduxAction: IReduxAction) => {
    const type = reduxAction.type;
    delete reduxAction.type;
    vuexDispatch(type, reduxAction);
  };
}
