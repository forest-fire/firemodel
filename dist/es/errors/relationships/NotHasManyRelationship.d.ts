import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../models/Model";
export declare class NotHasManyRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}