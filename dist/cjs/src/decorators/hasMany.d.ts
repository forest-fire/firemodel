import { IDictionary } from "common-types";
import { IFmFunctionToConstructor, IFmRelationshipDirectionality } from "./types";
export declare type IFmHasMany<T = true> = IDictionary<T>;
export declare function hasMany(fnToModelConstructor: IFmFunctionToConstructor, inverse?: string | [string, IFmRelationshipDirectionality]): (modelKlass: import("..").Model, key: string) => void;
