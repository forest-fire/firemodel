import { FmEvents } from "./actions";
export * from "./actions";
export * from "./redux";
export * from "./VuexWrapper";
export * from "./events";
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
