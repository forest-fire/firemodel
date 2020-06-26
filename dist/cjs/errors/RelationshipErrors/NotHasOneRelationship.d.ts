import { Model, Record } from "../../core";
import { FireModelError } from "../index";
export declare class NotHasOneRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}
