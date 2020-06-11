import { IAuditLogItem, IModelOptions } from "./@types";
import { AuditBase } from "./AuditBase";
import { Model } from "./models/Model";
import { epochWithMilliseconds } from "common-types";
export declare class AuditRecord<T extends Model> extends AuditBase {
    constructor(modelKlass: new () => T, id: string, options?: IModelOptions);
    /**
     * Queries the database for the first _x_ audit records [`howMany`] of
     * a given Record type. You can also optionally specify an offset to
     * start at [`startAt`].
     */
    first(howMany: number, startAt?: string): Promise<IAuditLogItem[]>;
    last(howMany: number, startAt?: string): Promise<IAuditLogItem[]>;
    since(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    before(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    between(after: epochWithMilliseconds | string, before: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    protected get auditLogs(): any;
    protected get byId(): any;
    protected byProp(prop: string): any;
}
