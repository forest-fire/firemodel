import { FireModelError, Model, Record } from "../private";
export declare class DynamicPropertiesNotReady<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, message?: string);
}
