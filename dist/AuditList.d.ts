import { Audit, IAuditLogItem } from "./Audit";
import { epochWithMilliseconds } from "common-types";
import { Model } from "./Model";
export declare class AuditList<T extends Model = Model> extends Audit<T> {
    constructor();
    first(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    last(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    since(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    before(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    between(from: epochWithMilliseconds | string, to: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
}
