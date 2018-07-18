import { Model, IModelOptions } from "./Model";
import { epochWithMilliseconds } from "common-types";
import { AuditList } from "./AuditList";
import { AuditRecord } from "./AuditRecord";
export interface IAuditLogItem {
    createdAt: epochWithMilliseconds;
    recordId: string;
    timestamp: epochWithMilliseconds;
    /** the record-level operation */
    action: IAuditOperations;
    /** the changes to properties, typically not represented in a "removed" op */
    changes: IAuditChange[];
}
export interface IAuditChange {
    /** the property name which changed */
    property: string;
    /** the property level operation */
    action: IAuditOperations;
    before: any;
    after: any;
}
export declare type IAuditOperations = "added" | "updated" | "removed";
export interface IAuditRecordReference {
    id: string;
    createdAt: number;
    action: IAuditOperations;
}
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
export declare function writeAudit(recordId: string, pluralName: string, action: IAuditOperations, changes: IAuditChange[], options?: IModelOptions): Promise<void>;
export declare class Audit<T extends Model = Model> {
    static list<T>(modelKlass: new () => T, options?: IModelOptions): AuditList<T>;
    static record<T>(modelKlass: new () => T, id: string, options?: IModelOptions): AuditRecord<T>;
}
