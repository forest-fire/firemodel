import { Model } from "./Model";
declare type Record<T> = import("./Record").Record<T>;
import { IDictionary } from "common-types";
import { IReduxDispatch } from "./state-mgmt";
import { RealTimeDB, IFirebaseConfig, IFirebaseAdminConfig } from "abstracted-firebase";
import { IFmModelMeta, IFmModelPropertyMeta, IFmModelRelationshipMeta } from "./decorators/types";
import { IFmChangedProperties } from "./@types";
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
    readonly dispatch: IReduxDispatch<import("./state-mgmt").IReduxAction, any>;
    static readonly isDefaultDispatch: boolean;
    readonly dispatchIsActive: boolean;
    /** the connected real-time database */
    readonly db: RealTimeDB;
    readonly pushKeys: string[];
    static auditLogs: string;
    /**
     * **connect**
     *
     * This static initializer facilitates connecting **FireModel** with
     * the firebase database in a compact and convenient way:
  ```typescript
  import { DB } from 'abstracted-xxx';
  const db = await FireModel.connect(DB, options);
  ```
     * This method not only sets **FireModel**'s `defaultDb` property but
     * also returns a reference to the `abstracted-client`/`abstracted-admin`
     * object so you can use this externally to FireModel should you choose to.
     *
     * Note: each _CRUD_ action in FireModel allows passing
     * in a DB connection (which opens up the possibility of multiple firebase
     * databases) but the vast majority of projects only have ONE firebase
     * database so this just makes the whole process much easier.
     */
    static connect<T extends RealTimeDB>(RTDB: {
        connect: (options: Partial<IFirebaseAdminConfig> & IFirebaseConfig) => T;
    }, options: Partial<IFirebaseAdminConfig> & IFirebaseConfig): Promise<T>;
    static register<T extends Model = Model>(model: new () => T): void;
    static listRegisteredModels(): string[];
    static lookupModel(name: string): new () => any;
    static isBeingWatched(path: string): boolean;
    private static _defaultDb;
    private static _dispatchActive;
    /** the dispatch function used to interact with frontend frameworks */
    private static _dispatch;
    /** the data structure/model that this class operates around */
    protected _model: T;
    protected _modelConstructor: new () => T;
    protected _db: RealTimeDB;
    protected _getPaths(rec: Record<T>, deltas: IFmChangedProperties<T>): IDictionary;
}
export interface IMultiPathUpdates {
    path: string;
    value: any;
}
export {};
