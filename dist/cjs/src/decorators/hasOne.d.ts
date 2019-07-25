import { Model } from "../Model";
import { IFmFunctionToConstructor, IFmRelationshipDirectionality } from "./types";
export declare function belongsTo<T = Model>(fnToModelConstructor: IFmFunctionToConstructor, inverse?: string | [string, IFmRelationshipDirectionality]): (modelKlass: Model, key: string) => void;
export declare const ownedBy: typeof belongsTo;
export declare const hasOne: typeof belongsTo;
