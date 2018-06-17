import { Model } from "./Model";
import { RealTimeDB } from "abstracted-firebase";
import { ISchemaOptions } from ".";
import { Record } from "./Record";
import { IDictionary } from "common-types";
import { IFMRecordEvent } from "./state-mgmt";
import { IReduxDispatch } from "./VuexWrapper";
export declare class FireModel<T extends Model> {
    static isBeingWatched(path: string): boolean;
    private static _defaultDb;
    /** the dispatch function used to interact with frontend frameworks */
    private static _dispatch;
    private static _dispatchActive;
    static defaultDb: import("abstracted-firebase").RealTimeDB;
    static dispatch: IReduxDispatch;
    /** the data structure/model that this class operates around */
    protected _model: T;
    protected _modelConstructor: new () => T;
    protected _db: RealTimeDB;
    readonly modelName: string;
    readonly pluralName: any;
    readonly dbPath: string;
    readonly localPath: string;
    readonly META: ISchemaOptions<T>;
    readonly properties: import("./decorators/schema").ISchemaMetaProperties<any>[];
    readonly relationships: import("./decorators/schema").ISchemaRelationshipMetaProperties<any>[];
    readonly dispatch: IReduxDispatch;
    readonly dispatchIsActive: boolean;
    /** the connected real-time database */
    readonly db: RealTimeDB;
    readonly pushKeys: string[];
    /**
     * Creates a Redux-styled event
     */
    protected _createRecordEvent(record: Record<T>, type: string, paths?: any[]): IFMRecordEvent<T>;
    protected _getPaths(changes: IDictionary): any[];
}
