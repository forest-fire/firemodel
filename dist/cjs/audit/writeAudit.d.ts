import { Record } from "../core";
import { IAuditChange, IAuditOperations, IModelOptions } from "../types";
/**
 * writeAudit
 *
 * Allows for a consistent way of writing audit records to the database
 *
 * @param recordId the ID of the record which is changing
 * @param pluralName the plural name of the Model type
 * @param action CRUD action
 * @param changes array of changes
 * @param options
 */
export declare function writeAudit<T>(record: Record<T>, action: IAuditOperations, changes: IAuditChange[], options?: IModelOptions): Promise<void>;
