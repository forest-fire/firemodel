import { IDictionary } from "common-types";
export declare type IFmHasMany<T = true> = IDictionary<T>;
export declare function hasMany(fnToModelConstructor: () => new () => any, inverse?: string): (modelKlass: import("../Model").Model, key: string) => void;
