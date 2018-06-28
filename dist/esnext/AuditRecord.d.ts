import { IAuditLogItem } from "./Audit";
import { epochWithMilliseconds } from "common-types";
import { Model, IModelOptions } from "./Model";
import { AuditBase } from "./AuditBase";
export declare class AuditRecord<T extends Model> extends AuditBase {
    constructor(modelKlass: new () => T, id: string, options?: IModelOptions);
    first(howMany: number, startAt?: string): Promise<IAuditLogItem[]>;
    last(howMany: number, startAt?: string): Promise<IAuditLogItem[]>;
    since(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    before(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    between(after: epochWithMilliseconds | string, before: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    protected readonly auditLogs: any;
    protected readonly byId: any;
    protected byProp(prop: string): any;
}
