import { epoch } from "common-types";
import { IMultiPathUpdates } from "../FireModel";
import { IFmCrudOperations, IReduxDispatch } from "..";
import { SerializedQuery } from "serialized-query";
import { Model } from "../Model";
import { ICompositeKey } from "../@types";
import { EventType } from "@firebase/database-types";
import { FmEvents } from "../state-mgmt";
export interface IFmWatcherStartOptions {
    /**
     * optionally provide a callback to be called when
     * the response for the given watcher's query has been fetched. This is
     * useful as it indicates when the local state has been synced with the
     * server state
     */
    once?: (evt: any) => void;
    /** optionally give the watcher a name to make lookup easier when stopping */
    name?: string;
}
/**
 * Meta information for events that are originated from **Firemodel**
 */
export interface IFmEvent<T> {
    type?: FmEvents;
    /** same as `value.id` but added to provide consistency to Firebase events */
    key: string;
    /**
     * A Unique ID for the given event payload
     */
    transactionId: string;
    /**
     * the specific CRUD action being performed
     */
    crudAction?: IFmCrudOperations;
    eventType: EventType | "local";
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
    changed?: Array<keyof T>;
    added?: Array<keyof T>;
    removed?: Array<keyof T>;
    /**
     * **priorValue**
     *
     * When a locally originated "update" is done the `changed` property will
     * be a hash where all the keys represent _changed_ values and the value is
     * the old/prior value.
     */
    priorValue?: T;
    errorCode?: string | number;
    errorMessage?: string;
}
export declare type IWatchEventClassification = "child" | "value";
export declare type IQuerySetter = (q: SerializedQuery) => void;
export declare type IWatchListQueries = "all" | "first" | "last" | "since" | "dormantSince" | "where" | "fromQuery" | "after" | "before" | "recent" | "inactive";
export declare type IWatcherSource = "list" | "record" | "list-of-records" | "unknown";
export interface IWatcherItemBase<T extends Model = Model> {
    watcherId: string;
    /** if defined, pass along the string name off the watcher */
    watcherName?: string;
    /**
     * Indicates whether the watcher is watching a **list**, a **record**,
     * or a **list of records**.
     */
    watcherSource: IWatcherSource;
    /**
     * The properties on the underlying _model_ which are needed
     * to compose the `CompositeKey` (excluding the `id` property)
     */
    dynamicPathProperties: string[];
    /**
     * If the underlying _model_ has a dynamic path then this key
     * will be an object containing `id` as well as all dynamic
     * path properties.
     *
     * If the _model_ does **not** have a dynamic path then this
     * will just be a string value for the key (same as `id`)
     */
    compositeKey: ICompositeKey<T>;
    /**
     * A constructor to build a model of the underlying model type
     */
    modelConstructor: new () => T;
    /** the _singular_ name of the Model */
    modelName: string;
    /** the _plural_ name of the Model */
    pluralName: string;
    /** the _local_ name of the Model */
    localModelName: string;
    /**
     * Indicates the **Firebase** event type/family; either `value` or `child`
     */
    eventFamily: IWatchEventClassification;
    query: SerializedQuery<T> | Array<SerializedQuery<T>>;
    /**
     * The date/time when this watcher was started.
     */
    createdAt: epoch;
    /**
     * The _dispatch_ function used to send **Actions** to the state management framework
     */
    dispatch: IReduxDispatch;
    /**
     * An array of of paths which this watcher is
     * watching. It will only be a _single_ path if
     * the watcher is a `list` or `record` watcher.
     */
    watcherPaths: string[];
    /**
     * the _local path_ in the frontend's state management
     * state tree to store this watcher's results.
     */
    localPath: string;
    /**
     * The _postfix_ string which resides off the root of the
     * local state management's state module. By default this
     * is `all` but can be modified on a per-model basis.
     */
    localPostfix: string;
}
/**
 * When watching a "list-of-records" you are really watching
 * a basket/array of underlying record watchers.
 */
export interface IWatcherItemListofRecords<T extends Model = Model> extends IWatcherItemBase<T> {
    watcherSource: "list-of-records";
    /**
     * The underlying _record queries_ used to achieve
     * the `list-of-records` watcher.
     */
    query: Array<SerializedQuery<T>>;
    eventType: "child";
}
export interface IWatcherItemList<T extends Model = Model> extends IWatcherItemBase<T> {
    watcherSource: "list";
    /**
     * The query setup to watch a `List`
     */
    query: SerializedQuery<T>;
    eventType: "child";
}
export interface IWatcherItemRecord<T extends Model = Model> extends IWatcherItemBase<T> {
    watcherSource: "record";
    /**
     * The query setup to watch a `Record`
     */
    query: SerializedQuery<T>;
    eventType: "value";
}
export declare type IWatcherItem<T extends Model = Model> = IWatcherItemList<T> | IWatcherItemRecord<T> | IWatcherItemListofRecords<T>;
