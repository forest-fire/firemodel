import "reflect-metadata";
import { Model } from "../Model";
export declare function hasMany(modelConstructor: new () => any): (modelKlass: Model, key: string) => void;
export declare function belongsTo<T = Model>(modelConstructor: new () => T): (modelKlass: Model, key: string) => void;
export declare function ownedBy<T = Model>(modelConstructor: new () => T): (modelKlass: Model, key: string) => void;
export declare function inverse(inverseProperty: string): (modelKlass: Model, key: string) => void;
