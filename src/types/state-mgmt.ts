import {
  FmEvents,
  IFmPathValuePair,
  IFmRecordMeta,
  IFmRelationshipOperation,
  IModel,
  IMultiPathUpdates,
  IWatchEventClassification,
  IWatcherSource,
} from "@/types";
import {
  IPathBasedWatchEvent,
  IRtdbDbEvent,
  ISerializedQuery,
  IValueBasedWatchEvent,
} from "universal-fire";
import { epoch, fk, pk } from "common-types";

// TODO: replace this with typing from universal-fire
import { IDictionary } from "common-types";

export type Extractable<T, U> = T extends U ? any : never;
export type NotString<T> = string extends T ? never : any;
function promoteStringToFMEvents<
  K extends string & NotString<K> & Extractable<FmEvents, K>
>(k: K): Extract<FmEvents, K> {
  return k;
}
export type IFmCrudOperation = "add" | "update" | "remove";
export const enum IFmCrudOperations {
  add = "add",
  update = "update",
  remove = "remove",
}
export type IFMEventName<T> = string & NotString<T> & Extractable<FmEvents, T>;
export interface IFmDispatchOptions {
  silent?: boolean;
  silentAcceptance?: boolean;
}

/**
 * the normal call signature of a **Redux** `dispatch()` call
 */
export type IReduxDispatch<T extends IReduxAction = IReduxAction, O = any> = (
  payload: T
) => Promise<O>;

/**
 * The structure of a Redux action message (aka, a dictionary with
 * at least the `type` attribute)
 */
export interface IReduxAction extends IDictionary {
  type: string;
}

export type IFmEventType =
  | "value"
  | "child_added"
  | "child_moved"
  | "child_removed"
  | "child_changed";

/**
 * An watcher based _event_ coming from Firebase.
 *
 * - an event will originate from either a "value" or "child" based
 * event watcher; this distinction is found in the `eventFamily` prop.
 * - typically a "value" based event happens when you watching a disvrete
 * `Record` whereas _child_ based events come from watching a Firebase
 * query.
 * - another distinction is **value** versus **path** based events; this distinction
 * is not strictly speaking a **Firebase** distinction but rather a **Firemodel**
 * distinction. Value based events
 */
export type IFmServerEvent =
  | IValueBasedWatchEvent
  | (IPathBasedWatchEvent & { value?: undefined });

/**
 * **IFmServerOrLocalEvent**
 *
 * Allows either a server event (aka, Firebase originated) or a locally
 * sourced event
 */
export type IFmServerOrLocalEvent<T> =
  | IFmServerEvent
  | IFmLocalEvent<T>
  | IFmWatcherEvent<T>;

export interface IFmWatcherEvent<T extends IModel = IModel> {
  type: FmEvents;
  kind: "watcher";
  key: string;
  modelConstructor: new () => T;
  value: any;
  offsets: IDictionary;
}

/**
 * All local events should provide the following meta
 */
export interface IFmLocalEventBase<T> {
  /** a FireModel event must state a type */
  type: FmEvents;
  /** the key of the record; if composite key then will take composite-reference format */
  key: pk;
  /**
   * A Unique ID for the given event payload
   */
  transactionId: string;
  eventType: IRtdbDbEvent | "local";
  /**
   * The event's payload value; this will be returned in all "value based"
   * events but not in "path based" events like relationship changes which
   * effect multiple records
   */
  value?: T;
  paths?: IMultiPathUpdates[];

  errorCode?: string | number;
  errorMessage?: string;
}

/**
 * **IFmLocalRelationshipEvent**
 *
 * The explicit shape of a IFmLocalEvent which convey's a **relationship**
 * change.
 *
 * Like Record events, there is the concept of a two-phased commit
 * where the first phase is an _optimistic_ expression of what "sucess"
 * would look like and the second phase is a _confirmation_ or _rollback_ event.
 *
 * **Note:** the concept of a "relationship" is purely a local/Firemodel convention.
 * The server events that a relationship change results in `RECORD_CHANGED` events
 * on both effected records.
 */
export interface IFmLocalRelationshipEvent<
  F extends IModel = IModel,
  T extends IModel = IModel
> extends IFmLocalEventBase<F> {
  kind: "relationship";
  operation: IFmRelationshipOperation;
  /** the property on the `from` model which has a FK ref to `to` model */
  property: keyof F & string;
  /**
   * The foreign key that the `from` model will be operating with on property `property`.
   * If the FK has a dynamic path then the FK will be represented as a composite ref.
   */
  fks: fk[];
  /** the property on the `to` model which points back to the `from` model */
  inverseProperty?: keyof T;
  /**
   * the model name of the `from` part of a relationship
   */
  from: string;
  /**
   * the model name of the `to` part of a relationship
   */
  to: string;
  /** the `localPath` of the _"from"_ part of the relationship */
  fromLocal: string;
  /** the `localPath` of the _"to"_ part of the relationship */
  toLocal: string;
  /** a constructor for the model of the _"from"_ record */
  fromConstructor: new () => F;
  /** a constructor for the model of the _"to"_ record */
  toConstructor: new () => T;
  value?: undefined;
  /**
   * **paths**
   *
   * The database paths which are effected by this relationship event.
   * The paths can impact one or two `Record`'s (based on whether the
   * foreign record has an "inverse" property)
   */
  paths: IFmPathValuePair[];
}

/**
 * Core event properties of a `Record` based change in **Firemodel**
 */
export interface IFmLocalRecordEvent<T extends IModel = IModel>
  extends IFmLocalEventBase<T> {
  kind: "record";
  operation: IFmCrudOperations;
  modelConstructor: new () => T;
  value: T;
  /**
   * **changed**
   *
   * An array of property names who's value has _changed_;
   * this is only available when the operation is set to
   * `update`.
   */
  changed?: Array<keyof T>;
  /**
   * **added**
   *
   * An array of property names who's value has been _added_;
   * this is only available when the operation is set to
   * `update`.
   */
  added?: Array<keyof T>;
  /**
   * **removed**
   *
   * An array of property names who's value has been _removed_;
   * this is only available when the operation is set to
   * `update`.
   */
  removed?: Array<keyof T>;
  /**
   * **priorValue**
   *
   * When a locally originated "update" is done the `changed` property will
   * be a hash where all the keys represent _changed_ values and the value is
   * the old/prior value.
   */
  priorValue?: T;
}

/**
 * Meta information for events that are originated from **Firemodel**. This event
 * type is then extended with _watcher context_
 */
export type IFmLocalEvent<T> =
  | IFmLocalRecordEvent<T>
  | IFmLocalRelationshipEvent<T>;

export interface IWatcherEventContextBase<T extends IModel = IModel>
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
  query: ISerializedQuery<T> | Array<ISerializedQuery<T>>;
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
export interface IWatcherEventContextListofRecords<T extends IModel = IModel>
  extends IWatcherEventContextBase<T> {
  watcherSource: "list-of-records";
  /**
   * The underlying _record queries_ used to achieve
   * the `list-of-records` watcher.
   */
  query: Array<ISerializedQuery<T>>;
  eventFamily: "child";
}

export interface IWatcherEventContextList<T extends IModel = IModel>
  extends IWatcherEventContextBase<T> {
  watcherSource: "list";
  /**
   * The query setup to watch a `List`
   */
  query: ISerializedQuery<T>;
  eventFamily: "child";
}

export interface IWatcherEventContextRecord<T extends IModel = IModel>
  extends IWatcherEventContextBase<T> {
  watcherSource: "record";
  /**
   * The query setup to watch a `Record`
   */
  query: ISerializedQuery<T>;
  eventFamily: "value";
}

/**
 * The meta information provided when a watcher is started;
 * it is also added to events when they have watcher context.
 */
export type IWatcherEventContext<T extends IModel = IModel> =
  | IWatcherEventContextList<T>
  | IWatcherEventContextRecord<T>
  | IWatcherEventContextListofRecords<T>;

/**
 * The Vuex equivalent of a Redux dispatch call
 */
export type IVuexDispatch<I = IFmLocalEvent<any>, O = any> = (
  type: string,
  payload: Omit<I, "type">
) => Promise<O>;
