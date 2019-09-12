import { IDictionary } from "common-types";
import { IFmFunctionToConstructor, IFmRelationshipDirectionality } from "./types";
export declare type IFmHasMany<T = true> = IDictionary<T>;
export declare function hasMany(fnToModelConstructor: IFmFunctionToConstructor | string, inverse?: string | [string, IFmRelationshipDirectionality]): void;
