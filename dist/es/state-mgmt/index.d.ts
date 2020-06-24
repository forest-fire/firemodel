import { FmEvents } from "./actions";
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
export * from "./IFmLocalEvent";
export * from "./IWatcherEventContext";
export * from "./UnwatchedLocalEvent";
export * from "./VuexWrapper";
export * from "./actions";
export * from "./events";
export * from "./redux";
