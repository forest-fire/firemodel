import { FireModelError } from "./FireModelError";
import { Record } from "../Record";
import { Model } from "../Model";
export declare class DynamicPropertiesNotReady<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, message?: string);
}
