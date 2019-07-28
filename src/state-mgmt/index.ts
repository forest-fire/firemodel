import { FmEvents } from "./actions";
export * from "./actions";
export * from "./redux";
export * from "./VuexWrapper";
export * from "./events";
export * from "./watcher-context";

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
  remove = "remove"
}

export type IFMEventName<T> = string & NotString<T> & Extractable<FmEvents, T>;

export interface IFmDispatchOptions {
  silent?: boolean;
  silentAcceptance?: boolean;
}
