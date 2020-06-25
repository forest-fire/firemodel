import { FireModelError, Model, Record } from "../../private";
export declare class NotHasOneRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}
