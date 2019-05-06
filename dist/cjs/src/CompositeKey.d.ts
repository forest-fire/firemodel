import { Record, Model } from "./index";
import { ICompositeKey } from "./@types/record-types";
export declare function createCompositeKey<T extends Model = Model>(rec: Record<T>): ICompositeKey;
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export declare function createCompositeKeyString<T extends Model = Model>(rec: Record<T>): any;
