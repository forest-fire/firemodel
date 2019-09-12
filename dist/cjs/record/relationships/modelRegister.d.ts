import { Model } from "../../Model";
/**
 * Registered a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
export declare function modelRegister<T extends Model = Model>(model: new () => T): void;
export declare function listRegisteredModels(): string[];
export declare function modelLookup(name: string): new () => any;
