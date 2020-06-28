import { ICompositeKey, IModel } from "../../@types/index";
import { Record } from "..";
/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
export declare function createCompositeKey<T extends IModel = IModel>(rec: Record<T>): ICompositeKey<T>;
