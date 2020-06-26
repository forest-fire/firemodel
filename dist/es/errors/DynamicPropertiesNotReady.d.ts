import { Model, Record } from "../core";
import { FireModelError } from "./index";
export declare class DynamicPropertiesNotReady<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, message?: string);
}
