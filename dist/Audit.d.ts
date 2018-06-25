import { Model, IModelOptions } from "./Model";
import { epochWithMilliseconds } from "common-types";
import { Record } from "./Record";
import { RealTimeDB } from "abstracted-firebase";
import { SerializedQuery } from "serialized-query";
import { AuditList } from "./AuditList";
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
export declare function writeAudit(recordId: string, pluralName: string, action: IAuditOperations, changes: IAuditChange[], options?: IModelOptions): Promise<void>;
export declare class Audit<T extends Model = Model> {
    static list<T>(modelKlass: new () => T, options?: IModelOptions): AuditList<T>;
    protected _modelKlass: new () => T;
    protected _record: Record<T>;
    protected _db: RealTimeDB;
    protected _query: SerializedQuery;
    protected _recordId: string;
    protected _property: string;
    protected readonly db: RealTimeDB;
    protected readonly dbPath: any;
}
