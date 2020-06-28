import { IAuditLogItem, IModel, IModelOptions } from "../types";
import { AuditBase } from "./";
import { epochWithMilliseconds } from "common-types";
export declare class AuditList<T extends IModel> extends AuditBase<T> {
    constructor(modelKlass: new () => T, options?: IModelOptions);
    first(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    last(howMany: number, offset?: number): Promise<IAuditLogItem[]>;
    since(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    before(when: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
    between(from: epochWithMilliseconds | string, to: epochWithMilliseconds | string): Promise<IAuditLogItem[]>;
}
