import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import Model, { ILogger } from "./model";
export interface IWriteOperation {
    id: string;
    type: "set" | "pushKey" | "update";
    path: string;
    value: any;
    callback: (type: string, value: any) => void;
}
export interface IRecordOptions {
    db?: RealTimeDB;
    logging?: ILogger;
    id?: string;
}
export declare class Record<T extends BaseSchema> {
    private _model;
    static create<T extends BaseSchema>(schema: new () => T, options?: IRecordOptions): Record<T>;
    static get<T extends BaseSchema>(schema: new () => T, id: string, options?: IRecordOptions): Promise<Record<T>>;
    private _existsOnDB;
    private _writeOperations;
    private _data?;
    constructor(_model: Model<T>, data?: any);
    readonly data: Readonly<T>;
    readonly isDirty: boolean;
    readonly META: ISchemaOptions;
    protected readonly db: RealTimeDB;
    protected readonly pluralName: string;
    protected readonly pushKeys: string[];
    readonly dbPath: string;
    readonly modelName: string;
    readonly id: T["id"];
    readonly localPath: string;
    initialize(data: T): void;
    readonly existsOnDB: boolean;
    load(id: string): Promise<this>;
    update(hash: Partial<T>): Promise<any>;
    pushKey<K extends keyof T>(property: K, value: T[K][keyof T[K]]): Promise<string>;
    set<K extends keyof T>(prop: K, value: T[K]): this;
    get<K extends keyof T>(prop: K): Readonly<T>[K];
    toString(): string;
    toJSON(): {
        dbPath: string;
        modelName: string;
        pluralName: string;
        key: T["id"];
        localPath: string;
        data: string;
    };
}
