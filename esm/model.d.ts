import { IDictionary, datetime } from "common-types";
import { RealTimeDB, rtdb } from "abstracted-firebase";
import { ISchemaMetaProperties, BaseSchema, Record, List } from "./index";
import { SchemaCallback } from "firemock";
import { SerializedQuery } from "serialized-query";
export declare type ModelProperty<T> = keyof T | keyof IBaseModel;
export declare type PartialModel<T> = {
    [P in keyof ModelProperty<T>]?: ModelProperty<T>[P];
};
export interface IBaseModel {
    createdAt: datetime;
    lastUpdated: datetime;
}
export interface ILogger {
    log: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
    error: (message: string) => void;
}
export interface IAuditFilter {
    since?: number;
    last?: number;
}
export declare type IComparisonOperator = "=" | ">" | "<";
export declare type IConditionAndValue = [IComparisonOperator, boolean | string | number];
export declare type FirebaseCrudOperations = "push" | "set" | "update" | "remove";
export interface IAuditRecord {
    crud: FirebaseCrudOperations;
    when: datetime;
    schema: string;
    key: string;
    info: IDictionary;
}
export interface IModelOptions {
    logger?: ILogger;
    db?: RealTimeDB;
}
export declare const baseLogger: ILogger;
export default class Model<T extends BaseSchema> {
    private _schemaClass;
    static defaultDb: RealTimeDB;
    static auditBase: string;
    static create<T>(schema: new () => T, options?: IModelOptions): Model<T>;
    protected _schema: T;
    readonly modelName: string;
    pluralName: string;
    mockGenerator: SchemaCallback;
    protected logger: ILogger;
    protected _pluralName: string;
    private _bespokeMockGenerator;
    private _db;
    constructor(_schemaClass: new () => T, db: RealTimeDB, logger?: ILogger);
    readonly schemaClass: new () => T;
    readonly db: RealTimeDB;
    readonly schema: T;
    readonly dbPath: string;
    readonly localPath: string;
    readonly relationships: ISchemaMetaProperties[];
    readonly properties: ISchemaMetaProperties[];
    readonly pushKeys: string[];
    newRecord(hash?: Partial<T>): Record<T>;
    getRecord(id: string): Promise<Record<T>>;
    getAll(query?: SerializedQuery): Promise<List<T>>;
    findRecord(prop: keyof T, value: string | number | boolean | IConditionAndValue): Promise<Record<T>>;
    findAll(prop: keyof T, value: string | number | boolean | IConditionAndValue): Promise<List<T>>;
    set(record: T, auditInfo?: IDictionary): Promise<any>;
    push(newRecord: Partial<T>, auditInfo?: IDictionary): Promise<rtdb.IReference<T>>;
    update(key: string, updates: Partial<T>, auditInfo?: IDictionary): Promise<void>;
    multiPathUpdate(payload: T[]): Promise<void>;
    remove(key: string, returnValue?: boolean, auditInfo?: IDictionary): Promise<T>;
    getAuditTrail(filter?: IAuditFilter): Promise<IAuditRecord[]>;
    private audit(crud, when, key, info);
    private crud(op, when, key, value?, auditInfo?);
    private _findBuilder(child, value, singular?);
    generate(quantity: number, override?: IDictionary): void;
    protected _mockGenerator: SchemaCallback;
    private _defaultGenerator;
    private now();
}
