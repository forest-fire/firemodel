import { SerializedQuery } from "serialized-query";
import { Model } from "../models/Model";
import { IWatchEventClassification, IReduxDispatch, IWatcherSource } from "..";
import { epoch } from "common-types";
import { IFmRecordMeta } from "./events";

export interface IWatcherEventContextBase<T extends Model = Model>
  extends IFmRecordMeta<T> {
  watcherId: string;
  /** if defined, pass along the string name off the watcher */
  watcherName?: string;
  /**
   * Indicates whether the watcher is watching a **list**, a **record**,
   * or a **list of records**.
   */
  watcherSource: IWatcherSource;
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
}

/**
 * When watching a "list-of-records" you are really watching
 * a basket/array of underlying record watchers.
 */
export interface IWatcherEventContextListofRecords<T extends Model = Model>
  extends IWatcherEventContextBase<T> {
  watcherSource: "list-of-records";
  /**
   * The underlying _record queries_ used to achieve
   * the `list-of-records` watcher.
   */
  query: Array<SerializedQuery<T>>;
  eventFamily: "child";
}

export interface IWatcherEventContextList<T extends Model = Model>
  extends IWatcherEventContextBase<T> {
  watcherSource: "list";
  /**
   * The query setup to watch a `List`
   */
  query: SerializedQuery<T>;
  eventFamily: "child";
}

export interface IWatcherEventContextRecord<T extends Model = Model>
  extends IWatcherEventContextBase<T> {
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
export type IWatcherEventContext<T extends Model = Model> =
  | IWatcherEventContextList<T>
  | IWatcherEventContextRecord<T>
  | IWatcherEventContextListofRecords<T>;
