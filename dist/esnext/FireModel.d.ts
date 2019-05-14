import { Model } from "./Model";
import { IDictionary } from "common-types";
import { IReduxDispatch } from "./VuexWrapper";
import { IFmModelMeta, IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./decorators/types";
declare type RealTimeDB = import("abstracted-firebase").RealTimeDB;
export declare class FireModel<T extends Model> {
    /**
    * Any FireModel transaction needs to connect to the database
    * via a passed-in reference to "abstracted-client" or "abstracted-admin"
    * database. These references can be done with any/every transaction via
    * the options hash but it is often more convient to set a "fallback" or
    * "default" database to use should a given transaction not state a DB
    * connection explicitly.
    */
    static defaultDb: RealTimeDB;
    /**
     * All Watchers and write-based transactions in FireModel offer a way to
     * call out to a "dispatch" function. This can be done on a per-transaction
     * basis but more typically it makes sense to just set this once here and then
     * all subsequent transactions will use this dispatch function unless they are
     * explicitly passed another.
     */
    /**
    * The default dispatch function which should be called/notified whenever
    * a write based transaction has modified state.
    */
    static dispatch: IReduxDispatch;
    /**
     * The name of the model; typically a "sigular" name
     */
    readonly modelName: string;
    /**
     * The plural name of the model (which plays a role in storage of state in both
     * the database as well as the dispatch function's path)
     */
    readonly pluralName: any;
    readonly dbPath: string;
    readonly localPath: string;
    readonly META: IFmModelMeta<T>;
    /**
     * A list of all the properties -- and those properties
     * meta information -- contained on the given model
     */
    readonly properties: IFmModelPropertyMeta[];
    /**
     * A list of all the realtionships -- and those relationships
     * meta information -- contained on the given model
     */
    readonly relationships: IFmModelRelationshipMeta[];
    readonly dispatch: IReduxDispatch<IDictionary<any>>;
    static readonly isDefaultDispatch: boolean;
    readonly dispatchIsActive: boolean;
    /** the connected real-time database */
    readonly db: RealTimeDB;
    readonly pushKeys: string[];
    static auditLogs: string;
    static isBeingWatched(path: string): boolean;
    private static _defaultDb;
    private static _dispatchActive;
    /** the dispatch function used to interact with frontend frameworks */
    private static _dispatch;
    /** the data structure/model that this class operates around */
    protected _model: T;
    protected _modelConstructor: new () => T;
    protected _db: RealTimeDB;
    protected _getPaths(changes: IDictionary): IMultiPathUpdates[];
}
export interface IMultiPathUpdates {
    path: string;
    value: any;
}
export {};
