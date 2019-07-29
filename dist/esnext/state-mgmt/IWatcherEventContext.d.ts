import { SerializedQuery } from "serialized-query";
import { Model } from "../Model";
import { IWatchEventClassification, IReduxDispatch, IWatcherSource, ICompositeKey } from "..";
import { epoch } from "common-types";
export interface IWatcherEventContextBase<T extends Model = Model> {
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
export interface IWatcherEventContextListofRecords<T extends Model = Model> extends IWatcherEventContextBase<T> {
    watcherSource: "list-of-records";
    /**
     * The underlying _record queries_ used to achieve
     * the `list-of-records` watcher.
     */
    query: Array<SerializedQuery<T>>;
    eventFamily: "child";
}
export interface IWatcherEventContextList<T extends Model = Model> extends IWatcherEventContextBase<T> {
    watcherSource: "list";
    /**
     * The query setup to watch a `List`
     */
    query: SerializedQuery<T>;
    eventFamily: "child";
}
export interface IWatcherEventContextRecord<T extends Model = Model> extends IWatcherEventContextBase<T> {
    watcherSource: "record";
    /**
     * The query setup to watch a `Record`
     */
    query: SerializedQuery<T>;
    eventFamily: "value";
}
/**
 * The meta information provided when a watcher is started;
 * it is also added to events when they have watcher context.
 */
export declare type IWatcherEventContext<T extends Model = Model> = IWatcherEventContextList<T> | IWatcherEventContextRecord<T> | IWatcherEventContextListofRecords<T>;
