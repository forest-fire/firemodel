import { Model, Record } from "..";
/**
 * When creating a new record it is sometimes desirable to pass in
 * the "payload" of FK's instead of just the FK. This function facilitates
 * that.
 */
export declare function buildDeepRelationshipLinks<T extends Model>(rec: Record<T>, property: keyof T): Promise<void>;
