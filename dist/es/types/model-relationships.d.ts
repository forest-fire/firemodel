import { IModel } from "./";
export declare type IModelConstructor<T extends IModel = any> = new () => IModelSubclass<T>;
/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export declare type IFnToModelConstructor<T extends IModel = IModel> = () => IModelConstructor<T>;
export declare type IModelSubclass<T extends IModel> = T;
