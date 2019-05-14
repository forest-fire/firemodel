import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
export declare class NotHasOneRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}
