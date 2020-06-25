import { ICompositeKey } from "../private";
export declare function createCompositeKeyFromFkString<T = ICompositeKey>(fkCompositeRef: string, modelConstructor?: new () => T): ICompositeKey<T>;
