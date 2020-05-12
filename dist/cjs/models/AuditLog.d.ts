import { Model } from "../models/Model";
import { IAuditOperations, IAuditChange } from "../@types/audit-types";
export declare class AuditLog extends Model {
    /** the `Model` which has been changed */
    modelName: string;
    /** the `id` of the record changing */
    modelId: string;
    /** the record-level operation */
    changes: IAuditChange[];
    /** the changes to properties, typically not represented in a "removed" op */
    action: IAuditOperations;
}
