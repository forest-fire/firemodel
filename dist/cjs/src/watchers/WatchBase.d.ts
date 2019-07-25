import { Model } from "../Model";
import { SerializedQuery } from "serialized-query";
import { FmModelConstructor, ICompositeKey } from "../@types";
import { IWatchEventClassification, IFmWatcherStartOptions, IWatcherItem } from "./types";
import { IReduxDispatch } from "../VuexWrapper";
import { RealTimeDB } from "abstracted-firebase";
import { WatchRecord } from "./WatchRecord";
/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export declare class WatchBase<T extends Model> {
    protected _query: SerializedQuery;
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
    /**
     * this is only to accomodate the list watcher using `ids` which is an aggregate of
     * `record` watchers.
     */
    protected _underlyingRecordWatchers: Array<WatchRecord<T>>;
    protected _watcherSource: "record" | "list"
    /** a "list of records" is an array of record-watchers which maps to an array in local state */
     | "list-of-records";
    protected _classProperties: string[];
    /**
     * **start**
     *
     * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
     * actively watched
     */
    start(options?: IFmWatcherStartOptions): Promise<IWatcherItem>;
    /**
     * **dispatch**
     *
     * allows you to state an explicit dispatch function which will be called
     * when this watcher detects a change; by default it will use the "default dispatch"
     * set on FireModel.dispatch.
     */
    dispatch(d: IReduxDispatch): this;
    toString(): string;
    protected readonly db: RealTimeDB;
}
