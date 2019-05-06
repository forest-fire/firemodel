import { IMultiPathUpdates } from "../FireModel";
import { IFmCrudOperations, IReduxDispatch } from "..";
import { SerializedQuery } from "serialized-query";
export interface IFmEvent<T> {
    /**
     * A Unique ID for the given event payload
     */
    transactionId: string;
    /**
     * The ID of the watcher(s) which are waiting for changes
     * at this DB path (or a parent of this path); it is possible
     * that there will be NO watchers at this path but in many
     * cases this will indicate a misconfiguration.
     */
    watcher?: string;
    /**
     * Indicates the scope of record/records that the
     * watcher is watching on
     */
    watcherSource?: IWatcherSource;
    crudAction?: IFmCrudOperations;
    /**
     * The event's payload value
     */
    value: T;
    /**
     * **paths**
     *
     * Optionally including the full set of paths that are being updated;
     * this is included because _multi-path-sets_ are used to set not only
     * a given record but also it's FK relationships when a relationship is
     * changed. In the localized event this points to paths which will resolve
     * to two server based changes (one to the primary model, one to the FK
     * model) while maintaining the overall set operation as an atomic transaction
     */
    paths?: IMultiPathUpdates[];
    /**
     * **changed**
     *
     * An array of property names who's value has changed
     */
    changed?: string[];
    added?: string[];
    removed?: string[];
    /**
     * **priorValue**
     *
     * When a locally originated "update" is done the `changed` property will
     * be a hash where all the keys represent _changed_ values and the value is
     * the old/prior value.
     */
    priorValue?: T;
    /**
     * **dbPath**
     *
     * The path in the database that this record came from
     */
    dbPath: string;
    /**
     * **localPath**
     *
     * The path in the local state tree where this record will go
     */
    localPath?: string;
    /**
     * If the watcher is a "list watcher" than the postfix is added
     * so that handlers now where to put the list off the `localPath`
     */
    localPostfix?: string;
    localPrefix?: string;
    errorCode?: string | number;
    errorMessage?: string;
}
export declare type IWatchEventClassification = "child" | "value";
export declare type IQuerySetter = (q: SerializedQuery) => void;
export declare type IWatchListQueries = "all" | "first" | "last" | "since" | "dormantSince" | "where" | "fromQuery" | "after" | "before" | "recent" | "inactive";
export declare type IWatcherSource = "list" | "record" | "unknown";
export interface IWatcherItem {
    watcherId: string;
    watcherSource: IWatcherSource;
    eventType: IWatchEventClassification;
    query: SerializedQuery;
    createdAt: number;
    dispatch: IReduxDispatch;
    dbPath: string;
    localPath: string;
}
