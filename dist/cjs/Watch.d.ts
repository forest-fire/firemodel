import { epochWithMilliseconds, IDictionary, Omit } from "common-types";
import { Model } from "./Model";
import { SerializedQuery } from "serialized-query";
import { IReduxDispatch } from "./VuexWrapper";
declare type RealTimeDB = import("abstracted-firebase").RealTimeDB;
import { IModelOptions, IComparisonOperator, FmModelConstructor } from "./@types/general";
import { IPrimaryKey } from "./@types/record-types";
export declare type IWatchEventClassification = "child" | "value";
export declare type IQuerySetter = (q: SerializedQuery) => void;
export declare type IWatchListQueries = "all" | "first" | "last" | "since" | "dormantSince" | "where" | "fromQuery" | "after" | "before" | "recent" | "inactive";
export interface IWatcherItem {
    watcherId: string;
    eventType: string;
    query: SerializedQuery;
    createdAt: number;
    dispatch: IReduxDispatch;
    dbPath: string;
    localPath: string;
}
export declare class Watch {
    static defaultDb: RealTimeDB;
    static dispatch: IReduxDispatch;
    static readonly inventory: IDictionary<IWatcherItem>;
    static toJSON(): IDictionary<IWatcherItem>;
    /**
     * lookup
     *
     * Allows the lookup of details regarding the actively watched
     * objects in the Firebase database
     *
     * @param hashCode the unique hashcode given for each watcher
     */
    static lookup(hashCode: string): IWatcherItem;
    static readonly watchCount: number;
    static reset(): void;
    /** stops watching either a specific watcher or ALL if no hash code is provided */
    static stop(hashCode?: string, oneOffDB?: RealTimeDB): void;
    static record<T extends Model>(modelConstructor: new () => T, pk: IPrimaryKey, options?: IModelOptions): Pick<Watch, "start" | "dispatch">;
    static list<T extends Model>(modelConstructor: new () => T, options?: IModelOptions): Pick<Watch, IWatchListQueries>;
    protected _query: SerializedQuery;
    protected _modelConstructor: FmModelConstructor<any>;
    protected _eventType: IWatchEventClassification;
    protected _dispatcher: IReduxDispatch;
    protected _db: RealTimeDB;
    protected _modelName: string;
    protected _pluralName: string;
    protected _localPath: string;
    protected _localPostfix: string;
    protected _dynamicProperties: string[];
    protected _watcherSource: "record" | "list";
    /** executes the watcher so that it becomes actively watched */
    start(): IWatcherItem;
    /**
     * allows you to state an explicit dispatch function which will be called
     * when this watcher detects a change; by default it will use the "default dispatch"
     * set on FireModel.dispatch.
     */
    dispatch(d: IReduxDispatch): Omit<Watch, IWatchListQueries | "toString" | "dispatch">;
    /**
     * since
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    since(when: epochWithMilliseconds | string, limit?: number): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * dormantSince
     *
     * Watch for all records that have NOT changed since a given date (opposite of "since")
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    dormantSince(when: epochWithMilliseconds | string, limit?: number): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * after
     *
     * Watch all records that were created after a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    after(when: epochWithMilliseconds | string, limit?: number): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * before
     *
     * Watch all records that were created before a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    before(when: epochWithMilliseconds | string, limit?: number): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * first
     *
     * Watch for a given number of records; starting with the first/earliest records (createdAt).
     * Optionally you can state an ID from which to start from. This is useful for a pagination
     * strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    first(howMany: number, startAt?: string): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * last
     *
     * Watch for a given number of records; starting with the last/most-recently added records
     * (e.g., createdAt). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    last(howMany: number, startAt?: string): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * recent
     *
     * Watch for a given number of records; starting with the recent/most-recently updated records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the recent record in the list to this value)
     */
    recent(howMany: number, startAt?: string): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * inactive
     *
     * Watch for a given number of records; starting with the inactive/most-inactively added records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the inactive record in the list to this value)
     */
    inactive(howMany: number, startAt?: string): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * fromQuery
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery<T extends Model>(inputQuery: SerializedQuery): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * all
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit?: number): Omit<Watch, IWatchListQueries | "toString">;
    /**
     * where
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where<T extends Model, K extends keyof T>(property: K, value: T[K] | [IComparisonOperator, T[K]]): Omit<Watch, IWatchListQueries | "toString">;
    toString(): string;
    protected readonly db: RealTimeDB;
}
export interface IWatcherApiPostQuery {
    /** executes the watcher so that it becomes actively watched */
    start: () => void;
    dispatch: IReduxDispatch;
}
export {};
