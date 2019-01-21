import { Model } from "../Model";
export declare type IFmHasOne = string;
export declare function belongsTo<T = Model>(fnToModelConstructor: () => new () => T, inverse?: string): (modelKlass: Model, key: string) => void;
export declare const ownedBy: typeof belongsTo;
export declare const hasOne: typeof belongsTo;
