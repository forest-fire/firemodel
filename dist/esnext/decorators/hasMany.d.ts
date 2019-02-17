import { IDictionary } from "common-types";
export declare type IFmHasMany = IDictionary<true>;
export declare function hasMany(fnToModelConstructor: () => new () => any, inverse?: string): (modelKlass: import("..").Model, key: string) => void;
