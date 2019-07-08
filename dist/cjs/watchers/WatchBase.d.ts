import { Model } from "../Model";
import { SerializedQuery } from "serialized-query";
import { FmModelConstructor, ICompositeKey } from "../@types";
import { IWatchEventClassification, IFmWatcherStartOptions, IWatcherItem } from "./types";
import { IReduxDispatch } from "../VuexWrapper";
import { RealTimeDB } from "abstracted-firebase";
/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export declare class WatchBase<T extends Model> {
    protected _query: SerializedQuery;
    protected _modelConstructor: FmModelConstructor<any>;
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
    protected _watcherSource: "record" | "list";
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
