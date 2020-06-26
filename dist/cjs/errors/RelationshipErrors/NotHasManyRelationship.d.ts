import { Model, Record } from "../../core";
import { FireModelError } from "../index";
export declare class NotHasManyRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}
