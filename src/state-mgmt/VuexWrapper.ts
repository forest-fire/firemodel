import { IReduxAction, IVuexDispatch } from "@/types";

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
