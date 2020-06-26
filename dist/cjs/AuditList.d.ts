import { AuditBase, Model } from "./private";
import { IAuditLogItem, IModelOptions } from "./@types/index";
import { epochWithMilliseconds } from "common-types";
export declare class AuditList<T extends Model> extends AuditBase<T> {
    constructor(modelKlass: new () => T, options?: IModelOptions);
    first(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    last(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    since(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    before(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    between(from: epochWithMilliseconds | string, to: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
}
