import { Model } from "./Model";
import { RealTimeDB } from "abstracted-firebase";
import { IModelMetaProperties } from "./index";
import { Record } from "./Record";
import { IDictionary } from "common-types";
import { IFMRecordEvent, FMEvents, NotString, Extractable, IFMEventName } from "./state-mgmt";
import { IReduxDispatch } from "./VuexWrapper";
export declare class FireModel<T extends Model> {
    static isBeingWatched(path: string): boolean;
    private static _defaultDb;
    private static _dispatchActive;
    /** the dispatch function used to interact with frontend frameworks */
    private static _dispatch;
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
    readonly META: IModelMetaProperties<T>;
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
    protected _createRecordEvent<K extends string & NotString<K> & Extractable<FMEvents, K>>(record: Record<T>, type: K, pathsOrValue: IMultiPathUpdates[] | T): IFMRecordEvent<T>;
    protected _createRelationshipEvent<K extends IFMEventName<K>>(record: Record<T>, type: K, relProp: keyof T, fk: string, paths?: any[]): any;
    protected _getPaths(changes: IDictionary): IMultiPathUpdates[];
}
export interface IMultiPathUpdates {
    path: string;
    value: any;
}
