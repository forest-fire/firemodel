import { IFmLocalEvent } from "../watchers/types";
import { IReduxAction } from ".";
/**
 * The Vuex equivalent of a Redux dispatch call
 */
export declare type IVuexDispatch<I = IFmLocalEvent<any>, O = any> = (type: string, payload: Omit<I, "type">) => Promise<O>;
/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export declare function VeuxWrapper<O = any>(vuexDispatch: IVuexDispatch<IReduxAction, O>): (reduxAction: IReduxAction) => Promise<O>;
