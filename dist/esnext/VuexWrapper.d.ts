import { IDictionary } from "common-types";
export declare type IVuexDispatch = (type: string, payload: IDictionary) => void;
export declare type IReduxDispatch = (payload: IDictionary) => void;
export interface IReduxAction extends IDictionary {
    type: string;
}
export declare const VeuxWrapper: (vuexDispatch: IVuexDispatch) => (reduxAction: IReduxAction) => void;
