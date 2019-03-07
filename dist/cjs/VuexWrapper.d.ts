import { IDictionary } from "common-types";
/**
 * The Vuex equivalent of a Redux dispatch call
 */
export declare type IVuexDispatch = (type: string, payload: IDictionary) => void;
/** the normal call signature of a redux dispatch call */
export declare type IReduxDispatch<T = IDictionary> = (payload: T) => void;
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
export declare function VeuxWrapper(vuexDispatch: IVuexDispatch): (reduxAction: IReduxAction) => void;
