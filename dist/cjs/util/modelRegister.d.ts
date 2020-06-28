import { IFnToModelConstructor, IModel, IModelConstructor } from "../types";
/**
 * Registers a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
export declare function modelRegister(...models: IModelConstructor[]): void;
export declare function listRegisteredModels(): string[];
export declare function modelRegistryLookup(name: string): new () => any;
/**
 * When you are building relationships to other `Model`'s it is often
 * benefitial to just pass in the name of the `Model` rather than it's
 * constructor as this avoids the dreaded "circular dependency" problem
 * that occur when you try to pass in class constructors which depend
 * on one another.
 */
export declare const modelNameLookup: (name: string) => () => IModelConstructor;
/**
 * When you are defining a _relationship_ between `Model`'s it sometimes
 * useful to just pass in the constructor to the other `Model`. This is in
 * contrast to just passing a string name of the model.
 *
 * The advantage here is that the external model does not need to be
 * "registered" separately whereas with a string name it would have to be.
 */
export declare const modelConstructorLookup: <T extends IModel>(constructor: IModelConstructor<T> | IFnToModelConstructor<T>) => () => IModelConstructor;
export declare function isConstructable(fn: IModelConstructor | IFnToModelConstructor): boolean;
