import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { SerializedQuery, IComparisonOperator } from "serialized-query";
import Model, { IModelOptions } from "./model";
export declare class List<T extends BaseSchema> {
    private _model;
    private _data;
    static create<T extends BaseSchema>(schema: new () => T, options?: IModelOptions): List<T>;
    static from<T extends BaseSchema>(schema: new () => T, query: SerializedQuery, options?: IModelOptions): Promise<List<T>>;
    static first<T extends BaseSchema>(schema: new () => T, howMany: number, options?: IModelOptions): Promise<List<T>>;
    static recent<T extends BaseSchema>(schema: new () => T, howMany: number, options?: IModelOptions): Promise<List<T>>;
    static inactive<T extends BaseSchema>(schema: new () => T, howMany: number, options?: IModelOptions): Promise<List<T>>;
    static last<T extends BaseSchema>(schema: new () => T, howMany: number, options?: IModelOptions): Promise<List<T>>;
    static where<T extends BaseSchema, K extends keyof T>(schema: new () => T, property: K, value: T[K] | [IComparisonOperator, T[K]], options?: IModelOptions): Promise<List<T>>;
    constructor(_model: Model<T>, _data?: T[]);
    readonly length: number;
    protected readonly db: RealTimeDB;
    readonly modelName: string;
    readonly pluralName: string;
    readonly dbPath: string;
    readonly localPath: string;
    readonly meta: ISchemaOptions;
    filter(f: ListFilterFunction<T>): List<T>;
    map<K = any>(f: ListMapFunction<T, K>): K[];
    readonly data: T[];
    load(pathOrQuery: string | SerializedQuery<T>): Promise<this>;
}
export declare type ListFilterFunction<T> = (fc: T) => boolean;
export declare type ListMapFunction<T, K = any> = (fc: T) => K;
