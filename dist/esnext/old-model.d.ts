import { IDictionary, datetime } from "common-types";
import { Model, Record, List } from ".";
import { SchemaCallback } from "firemock";
import { SerializedQuery } from "serialized-query";
import { ISchemaRelationshipMetaProperties, ISchemaMetaProperties } from "./decorators/schema";
import { FireModel } from "./FireModel";
import { RealTimeDB } from "abstracted-firebase";
export declare type ModelProperty<T> = keyof T | keyof IBaseModel;
export declare type PartialModel<T> = {
    [P in keyof ModelProperty<T>]?: ModelProperty<T>[P];
};
/**
 * all models should extend the base model therefore we can
 * expect these properties to always exist
 */
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
    /** audit entries since a given unix epoch timestamp */
    since?: number;
    /** the last X number of audit entries */
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
    db?: import("abstracted-firebase").RealTimeDB;
}
export declare const baseLogger: ILogger;
export declare class OldModel<T extends Model> extends FireModel<T> {
    private _schemaClass;
    static defaultDb: RealTimeDB;
    /** The base path in the database to store audit logs */
    static auditBase: string;
    static create<T>(schema: new () => T, options?: IModelOptions): OldModel<T>;
    /** Instantiation of schema class for meta analysis */
    protected _schema: T;
    /** the singular name of the model */
    readonly modelName: string;
    pluralName: string;
    mockGenerator: SchemaCallback;
    protected logger: ILogger;
    /** allows for pluralized name of the model to be set explicitly */
    protected _pluralName: string;
    private _bespokeMockGenerator;
    /**
     * All access to the database is done via a passed in dependency which
     * meets the contracts specified by the RealTimeDB interface
     */
    private _db;
    constructor(_schemaClass: new () => T, db: RealTimeDB, logger?: ILogger);
    readonly schemaClass: new () => T;
    /** Database access */
    readonly db: RealTimeDB;
    readonly schema: T;
    readonly dbPath: string;
    readonly localPath: string;
    readonly relationships: ISchemaRelationshipMetaProperties[];
    readonly properties: ISchemaMetaProperties[];
    readonly pushKeys: string[];
    /**
     * Get an existing record from the  DB and return as a Record
     *
     * @param id the primary key for the record
     */
    getRecord(id: string): Promise<Record<T>>;
    /**
     * Returns a list of ALL objects of the given schema type
     */
    getAll(query?: SerializedQuery): Promise<any>;
    /**
     * Finds a single records within a list
     *
     * @param prop the property on the Schema which you are looking for a value in
     * @param value the value you are looking for the property to equal; alternatively you can pass a tuple with a comparison operation and a value
     */
    findRecord(prop: keyof T, value: string | number | boolean | IConditionAndValue): Promise<Record<T>>;
    findAll(prop: keyof T, value: string | number | boolean | IConditionAndValue): Promise<List<T>>;
    /** sets a record to the database */
    set(record: T, auditInfo?: IDictionary): Promise<any>;
    /** Push a new record onto a model's list and returns a Firebase reference to this new record */
    push(newRecord: Partial<T>, auditInfo?: IDictionary): Promise<any>;
    /** non-destructive update to a record's data */
    update(key: string, updates: Partial<T>, auditInfo?: IDictionary): Promise<void>;
    /**
     * Remove
     *
     * Remove a record from the database
     *
     * @param key         the specific record id (but can alternatively be the full path if it matches dbPath)
     * @param returnValue optionally pass back the deleted record along removing from server
     * @param auditInfo   any additional information to be passed to the audit record (if Model has turned on)
     */
    remove(key: string, returnValue?: boolean, auditInfo?: IDictionary): Promise<T>;
    getAuditTrail(filter?: IAuditFilter): Promise<IAuditRecord[]>;
    private audit;
    /**
     * crud
     *
     * Standardized processing of all CRUD operations
     *
     * @param op The CRUD operation being performed
     * @param key The record id which is being performed on
     * @param value The new-value parameter (meaning varies on context)
     * @param auditInfo the meta-fields for the audit trail
     */
    private crud;
    private _findBuilder;
    generate(quantity: number, override?: IDictionary): void;
    protected _mockGenerator: SchemaCallback;
    private _defaultGenerator;
    private now;
}
