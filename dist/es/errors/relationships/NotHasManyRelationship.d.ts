import { FireModelError, Model, Record } from "../../private";
export declare class NotHasManyRelationship<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: string, method: string);
}
