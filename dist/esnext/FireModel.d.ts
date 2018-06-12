import { Model } from "./model";
import { RealTimeDB } from "abstracted-firebase";
import { ISchemaOptions } from ".";
export declare class FireModel<T = Model> {
    private static _defaultDb;
    static defaultDb: import("abstracted-firebase").RealTimeDB;
    /** the data structure/model that this class operates around */
    protected _model: T;
    protected _modelConstructor: new () => T;
    protected _db: RealTimeDB;
    readonly modelName: string;
    readonly pluralName: string;
    readonly META: ISchemaOptions;
    readonly properties: import("./decorators/schema").ISchemaMetaProperties[];
    readonly relationships: import("./decorators/schema").ISchemaRelationshipMetaProperties[];
    /** the connected real-time database */
    readonly db: RealTimeDB;
    protected readonly pushKeys: string[];
}
