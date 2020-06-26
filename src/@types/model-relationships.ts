import { Model } from "@/models";

export type IModelConstructor<T extends Model = any> = new () => IModelSubclass<
  T
>;

/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export type IFnToModelConstructor<
  T extends Model = Model
> = () => IModelConstructor<T>;

export type IModelSubclass<T extends Model> = T;
