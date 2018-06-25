import { epochWithMilliseconds, IDictionary } from "common-types";
import { Model } from "./Model";
import { SerializedQuery } from "serialized-query";
import { IReduxDispatch } from "./VuexWrapper";
import { RealTimeDB } from "../node_modules/abstracted-admin/dist/esnext";
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
    static record<T extends Model>(modelClass: new () => T, recordId: string): {
        start: any;
        dispatch: any;
    };
    static list<T extends Model>(modelConstructor: new () => T): {
        all: (limit?: number) => {
            start: any;
            dispatch: any;
        };
        since: (when: string | number) => {
            start: any;
            dispatch: any;
        };
        fromQuery: <T_1 extends Model>(inputQuery: SerializedQuery<any>) => void;
    };
    protected _query: SerializedQuery;
    protected _eventType: IWatchEventClassification;
    protected _dispatcher: IReduxDispatch;
    protected _db: RealTimeDB;
    protected _modelName: string;
    protected _pluralName: string;
    protected _localPath: string;
    start(): string;
    stop(hashCode?: string): void;
    dispatch(d: IReduxDispatch): {
        start: any;
    };
    /**
     * since
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     */
    since(when: epochWithMilliseconds | string): {
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
    fromQuery<T extends Model>(inputQuery: SerializedQuery): void;
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
    toString(): string;
    protected readonly db: RealTimeDB;
    protected apiList(context: IDictionary): {
        all: (limit?: number) => {
            start: any;
            dispatch: any;
        };
        since: (when: string | number) => {
            start: any;
            dispatch: any;
        };
        fromQuery: <T extends Model>(inputQuery: SerializedQuery<any>) => void;
    };
    protected apiPostQuery(context: IDictionary): {
        start: any;
        dispatch: any;
    };
    protected apiStartOnly(context: IDictionary): {
        start: any;
    };
}
