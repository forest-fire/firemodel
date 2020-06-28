import { IReduxAction, IVuexDispatch } from "../types";
/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export declare function VeuxWrapper<O = any>(vuexDispatch: IVuexDispatch<IReduxAction, O>): (reduxAction: IReduxAction) => Promise<O>;
