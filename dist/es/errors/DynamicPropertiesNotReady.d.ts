import { FireModelError } from "./FireModelError";
import { Record } from "../Record";
import { Model } from "../models/Model";
export declare class DynamicPropertiesNotReady<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, message?: string);
}
