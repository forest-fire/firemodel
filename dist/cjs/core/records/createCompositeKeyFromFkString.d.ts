import { ICompositeKey } from "../../types";
export declare function createCompositeKeyFromFkString<T = ICompositeKey>(fkCompositeRef: string, modelConstructor?: new () => T): ICompositeKey<T>;
