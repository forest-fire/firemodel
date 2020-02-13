import { Model } from "../models/Model";
import { SerializedQuery } from "serialized-query";
import { FmModelConstructor, ICompositeKey } from "../@types";
import { IWatchEventClassification, IFmWatcherStartOptions } from "./types";
import { IReduxDispatch, IWatcherEventContext } from "../state-mgmt";
import { RealTimeDB } from "abstracted-firebase";
import { IListOptions } from "../index";
import { IDictionary } from "common-types";
import { WatchRecord } from "./WatchRecord";
/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export declare class WatchBase<T extends Model> {
    protected _query: SerializedQuery<T>;
    protected _modelConstructor: FmModelConstructor<T>;
    protected _eventType: IWatchEventClassification;
    protected _dispatcher: IReduxDispatch;
    protected _db: RealTimeDB;
    protected _modelName: string;
    protected _localModelName: string;
    protected _pluralName: string;
    protected _localPath: string;
    protected _localPostfix: string;
    protected _dynamicProperties: string[];
    protected _compositeKey: ICompositeKey<T>;
    protected _options: IListOptions<T> | IDictionary;
    /**
     * this is only to accomodate the list watcher using `ids` which is an aggregate of
     * `record` watchers.
     */
    protected _underlyingRecordWatchers: Array<WatchRecord<T>>;
    protected _watcherSource: "record" | "list"
    /** a "list of records" is an array of record-watchers which maps to an array in local state */
     | "list-of-records";
    /**
     * An optional name that can be set by the initiator of the watcher; if not
     * set then it will be the same as the `watcherId`
     */
    protected _watcherName: string;
    protected _classProperties: string[];
    /**
     * **start**
     *
     * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
     * actively watched
     */
    start(options?: IFmWatcherStartOptions): Promise<IWatcherEventContext<T>>;
    /**
     * **dispatch**
     *
     * allows you to state an explicit dispatch function which will be called
     * when this watcher detects a change; by default it will use the "default dispatch"
     * set on FireModel.dispatch.
     */
    dispatch(d: IReduxDispatch): this;
    toString(): string;
    /**
     * Allows you to use the properties of the watcher to build a
     * `watcherContext` dictionary; this is intended to be used as
     * part of the initialization of the `dispatch` function for
     * local state management.
     *
     * **Note:** that while used here as part of the `start()` method
     * it is also used externally by locally triggered events as well
     */
    buildWatcherItem(name?: string): IWatcherEventContext<T>;
    protected getCoreDispatch(): IReduxDispatch<import("..").IReduxAction, any>;
    protected get db(): RealTimeDB;
}
