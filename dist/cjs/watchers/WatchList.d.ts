import { WatchBase } from "./WatchBase";
import { Model } from "../models/Model";
import { IListOptions, IPrimaryKey } from "../@types";
import { SerializedQuery, IComparisonOperator } from "serialized-query";
import { epochWithMilliseconds } from "common-types";
export declare class WatchList<T extends Model> extends WatchBase<T> {
    static list<T extends Model>(
    /**
     * The `Model` underlying the **List**
     */
    modelConstructor: new () => T, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    options?: IListOptions<T>): WatchList<T>;
    protected _offsets: Partial<T>;
    protected _options: IListOptions<T>;
    list(modelConstructor: new () => T, options?: IListOptions<T>): WatchList<T>;
    /**
     *
     * @param offsetDict
     */
    offsets(offsetDict: Partial<T>): this;
    /**
     * **ids**
     *
     * There are times where you know an array of IDs which you want to watch as a `list`
     * and calling a series of **record** watchers would not work because -- for a given model
     * -- you can only watch one (this is due to the fact that a _record_ watcher does not
     * offset the record by it's ID). This is the intended use-case for this type of _list_
     * watcher.
     *
     * It is worth noting that with this watcher the frontend will indeed get an array of
     * records but from a **Firebase** standpoint this is not a "list watcher" but instead
     * a series of "record watchers".
     *
     * @param ids the list of FK references (simple or composite)
     */
    ids(...ids: Array<IPrimaryKey<T>>): this;
    /**
     * **since**
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    since(when: epochWithMilliseconds | string, limit?: number): WatchList<T>;
    /**
     * **dormantSince**
     *
     * Watch for all records that have NOT changed since a given date (opposite of "since")
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    dormantSince(when: epochWithMilliseconds | string, limit?: number): WatchList<T>;
    /**
     * **after**
     *
     * Watch all records that were created after a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    after(when: epochWithMilliseconds | string, limit?: number): WatchList<T>;
    /**
     * **before**
     *
     * Watch all records that were created before a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    before(when: epochWithMilliseconds | string, limit?: number): WatchList<T>;
    /**
     * **first**
     *
     * Watch for a given number of records; starting with the first/earliest records (createdAt).
     * Optionally you can state an ID from which to start from. This is useful for a pagination
     * strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    first(howMany: number, startAt?: string): WatchList<T>;
    /**
     * **last**
     *
     * Watch for a given number of records; starting with the last/most-recently added records
     * (e.g., createdAt). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    last(howMany: number, startAt?: string): WatchList<T>;
    /**
     * **recent**
     *
     * Watch for a given number of records; starting with the recent/most-recently updated records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the recent record in the list to this value)
     */
    recent(howMany: number, startAt?: string): WatchList<T>;
    /**
     * **inactive**
     *
     * Watch for a given number of records; starting with the inactive/most-inactively added records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the inactive record in the list to this value)
     */
    inactive(howMany: number, startAt?: string): WatchList<T>;
    /**
     * **fromQuery**
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery(inputQuery: SerializedQuery<T>): WatchList<T>;
    /**
     * **all**
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit?: number): WatchList<T>;
    /**
     * **where**
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where<K extends keyof T>(property: K & string, value: T[K] | [IComparisonOperator, T[K]]): WatchList<T>;
    /**
     * Sets properties that could be effected by _dynamic paths_
     */
    protected setPathDependantProperties(): void;
}
