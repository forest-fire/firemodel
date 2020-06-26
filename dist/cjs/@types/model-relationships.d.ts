import { Model } from "@/models";
export declare type IModelConstructor<T extends Model = any> = new () => IModelSubclass<T>;
/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export declare type IFnToModelConstructor<T extends Model = Model> = () => IModelConstructor<T>;
export declare type IModelSubclass<T extends Model> = T;
