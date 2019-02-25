import { Record, Model } from "../index";
import { ICompositeKey } from "../@types/record-types";
export declare function createCompositeKey(rec: Record<Model>): ICompositeKey;
/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export declare function createCompositeKeyString(rec: Record<Model>): any;
