import { epochWithMilliseconds, IDictionary } from "common-types";
import { Model, IComparisonOperator, IModelOptions } from "./Model";
import { SerializedQuery } from "serialized-query";
import { IReduxDispatch } from "./VuexWrapper";
import { RealTimeDB } from "abstracted-firebase";
export declare type IWatchEventClassification = "child" | "value";
export declare type IQuerySetter = (q: SerializedQuery) => void;
export interface IWatcherItem {
    eventType: string;
    query: SerializedQuery;
    createdAt: number;
    dispatch: IReduxDispatch;
    dbPath: string;
}
export declare class Watch {
    static defaultDb: RealTimeDB;
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
    static stop(hashCode?: string, oneOffDB?: RealTimeDB): void;
    static record<T extends Model>(modelClass: new () => T, recordId: string, options?: IModelOptions): {
        start: any;
        dispatch: any;
    };
    static list<T extends Model>(modelConstructor: new () => T, options?: IModelOptions): {
        all: any;
        since: any;
        first: any;
        last: any;
        recent: any;
        inactive: any;
        where: any;
        fromQuery: any;
    };
    protected _query: SerializedQuery;
    protected _eventType: IWatchEventClassification;
    protected _dispatcher: IReduxDispatch;
    protected _db: RealTimeDB;
    protected _modelName: string;
    protected _pluralName: string;
    protected _localPath: string;
    start(): string;
    dispatch(d: IReduxDispatch): {
        start: any;
    };
    /**
     * since
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    since(when: epochWithMilliseconds | string, limit?: number): {
        start: any;
        dispatch: any;
    };
    /**
     * dormantSince
     *
     * Watch for all records that have NOT changed since a given date (opposite of "since")
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    dormantSince(when: epochWithMilliseconds | string, limit?: number): {
        start: any;
        dispatch: any;
    };
    /**
     * after
     *
     * Watch all records that were created after a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    after(when: epochWithMilliseconds | string, limit?: number): {
        start: any;
        dispatch: any;
    };
    /**
     * before
     *
     * Watch all records that were created before a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    before(when: epochWithMilliseconds | string, limit?: number): {
        start: any;
        dispatch: any;
    };
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
    first(howMany: number, startAt?: string): {
        start: any;
        dispatch: any;
    };
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
    last(howMany: number, startAt?: string): {
        start: any;
        dispatch: any;
    };
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
    recent(howMany: number, startAt?: string): {
        start: any;
        dispatch: any;
    };
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
    inactive(howMany: number, startAt?: string): {
        start: any;
        dispatch: any;
    };
    /**
     * fromQuery
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery<T extends Model>(inputQuery: SerializedQuery): {
        start: any;
        dispatch: any;
    };
    /**
     * all
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit?: number): {
        start: any;
        dispatch: any;
    };
    /**
     * where
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where<T extends Model, K extends keyof T>(property: K, value: T[K] | [IComparisonOperator, T[K]]): {
        start: any;
        dispatch: any;
    };
    toString(): string;
    protected readonly db: RealTimeDB;
    protected apiList(context: IDictionary): {
        all: any;
        since: any;
        first: any;
        last: any;
        recent: any;
        inactive: any;
        where: any;
        fromQuery: any;
    };
    protected apiPostQuery(context: IDictionary): {
        start: any;
        dispatch: any;
    };
    protected apiStartOnly(context: IDictionary): {
        start: any;
    };
}
