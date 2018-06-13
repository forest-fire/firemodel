import { ListProxy } from "../ListProxy";
export declare const CreateListProxy: <T = any>(modelContructor: new () => T) => (list: T[]) => ListProxy<T>;
