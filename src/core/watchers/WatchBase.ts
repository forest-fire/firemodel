import { IDictionary } from "common-types";

import type { ISerializedQuery, IAbstractedDatabase } from "universal-fire";

import {
  WatchRecord,
  addToWatcherPool,
  waitForInitialization,
  WatchDispatcher,
} from "@/core/watchers";
import { List, FireModel } from "@/core";
import {
  FmEvents,
  IWatcherEventContext,
  IFmWatcherStartOptions,
  IWatchEventClassification,
  IListOptions,
  IReduxDispatch,
  FmModelConstructor,
  ICompositeKey,
  IModel,
} from "@/types";
import { FireModelError, FireModelProxyError } from "@/errors";

/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export class WatchBase<T extends IModel> {
  protected _query: ISerializedQuery<T>;
  protected _modelConstructor: FmModelConstructor<T>;
  protected _eventType: IWatchEventClassification;
  protected _dispatcher: IReduxDispatch;
  protected _db: IAbstractedDatabase;
  protected _modelName: string;
  protected _localModelName: string;
  protected _pluralName: string;
  protected _localPath: string;
  protected _localPostfix: string;
  protected _dynamicProperties: string[];
  protected _compositeKey: ICompositeKey<T>;
  protected _options: IListOptions<T> | IDictionary;
  /**
   * this is only to accomodate the list watcher using `ids` which is an aggregate of
   * `record` watchers.
   */
  protected _underlyingRecordWatchers: Array<WatchRecord<T>> = [];
  protected _watcherSource:
    | "record"
    | "list"
    /** a "list of records" is an array of record-watchers which maps to an array in local state */
    | "list-of-records";
  /**
   * An optional name that can be set by the initiator of the watcher; if not
   * set then it will be the same as the `watcherId`
   */
  protected _watcherName: string;
  protected _classProperties: string[];

  /**
   * **start**
   *
   * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
   * actively watched
   */
  public async start(
    options: IFmWatcherStartOptions = {}
  ): Promise<IWatcherEventContext<T>> {
    const isListOfRecords = this._watcherSource === "list-of-records";
    const watchIdPrefix = isListOfRecords ? "wlr" : "w";
    let watchHashCode;
    try {
      watchHashCode = isListOfRecords
        ? String(this._underlyingRecordWatchers[0]._query.hashCode())
        : String(this._query.hashCode());
    } catch (e) {
      throw new FireModelProxyError(
        e,
        `An error occured trying to start a watcher. The source was "${this._watcherSource}" and had a query of: ${this._query}\n\nThe underlying error was: ${e.message}`,
        "watcher/not-allowed"
      );
    }

    const watcherId = watchIdPrefix + "-" + watchHashCode;
    this._watcherName = options.name || `${watcherId}`;
    const watcherName = options.name || this._watcherName || `${watcherId}`;

    const watcherItem = this.buildWatcherItem(watcherName);

    // The dispatcher will now have all the context it needs to publish events
    // in a consistent fashion; this dispatch function will be used both by
    // both locally originated events AND server based events.
    const dispatch = WatchDispatcher<T>(watcherItem.dispatch)(watcherItem);

    if (!this.db) {
      throw new FireModelError(
        `Attempt to start a watcher before the database connection has been established!`
      );
    }

    try {
      if (this._eventType === "value") {
        if (this._watcherSource === "list-of-records") {
          // Watch all "ids" added to the list of records
          this._underlyingRecordWatchers.forEach((r) => {
            this.db.watch(r._query, ["value"], dispatch);
          });
        } else {
          this.db.watch(this._query, ["value"], dispatch);
        }
      } else {
        if (options.largePayload) {
          const payload = await List.fromQuery(
            this._modelConstructor,
            this._query,
            { offsets: this._options.offsets || {} }
          );

          await dispatch({
            type: FmEvents.WATCHER_SYNC,
            kind: "watcher",
            modelConstructor: this._modelConstructor,
            key: this._query.path.split("/").pop(),
            value: payload.data,
            offsets: this._options.offsets || {},
          });
        }

        this.db.watch(
          this._query,
          ["child_added", "child_changed", "child_moved", "child_removed"],
          dispatch
        );
      }
    } catch (e) {
      console.log(`Problem starting watcher [${watcherId}]: `, e);
      (this._dispatcher || FireModel.dispatch)({
        type: FmEvents.WATCHER_FAILED,
        errorMessage: e.message,
        errorCode: e.code || e.name || "firemodel/watcher-failed",
      });
      throw e;
    }

    try {
      addToWatcherPool(watcherItem);
      // dispatch "starting"; no need to wait for promise
      (this._dispatcher || FireModel.dispatch)({
        type: FmEvents.WATCHER_STARTING,
        ...watcherItem,
      });

      await waitForInitialization(watcherItem);

      await (this._dispatcher || FireModel.dispatch)({
        type: FmEvents.WATCHER_STARTED,
        ...watcherItem,
      });

      return watcherItem;
    } catch (e) {
      throw new FireModelError(
        `The watcher "${watcherId}" failed to initialize`,
        "firemodel/watcher-initialization"
      );
    }
  }

  /**
   * **dispatch**
   *
   * allows you to state an explicit dispatch function which will be called
   * when this watcher detects a change; by default it will use the "default dispatch"
   * set on FireModel.dispatch.
   */
  public dispatch(d: IReduxDispatch) {
    this._dispatcher = d;
    return this;
  }

  public toString() {
    return `Watching path "${this._query.path}" for "${
      this._eventType
    }" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
  }

  /**
   * Allows you to use the properties of the watcher to build a
   * `watcherContext` dictionary; this is intended to be used as
   * part of the initialization of the `dispatch` function for
   * local state management.
   *
   * **Note:** that while used here as part of the `start()` method
   * it is also used externally by locally triggered events as well
   */
  public buildWatcherItem(name?: string): IWatcherEventContext<T> {
    const dispatch = this.getCoreDispatch();
    const isListOfRecords = this._watcherSource === "list-of-records";
    const watchIdPrefix = isListOfRecords ? "wlr" : "w";
    const watchHashCode = isListOfRecords
      ? String(this._underlyingRecordWatchers[0]._query.hashCode())
      : String(this._query.hashCode());
    const watcherId = watchIdPrefix + "-" + watchHashCode;
    const watcherName = name || `${watcherId}`;
    const eventFamily: IWatchEventClassification =
      this._watcherSource === "list" ? "child" : "value";
    const watcherPaths =
      this._watcherSource === "list-of-records"
        ? this._underlyingRecordWatchers.map((i) => i._query.path)
        : [this._query.path];
    // TODO: fix this bullshit typing; should be: SerializedQuery<T> | Array<SerializedQuery<T>>
    const query: any =
      this._watcherSource === "list-of-records"
        ? this._underlyingRecordWatchers.map((i) => i._query)
        : this._query;

    const watchContext: IWatcherEventContext<T> = {
      watcherId,
      watcherName,
      eventFamily,
      dispatch,
      modelConstructor: this._modelConstructor,
      query,
      dynamicPathProperties: this._dynamicProperties,
      compositeKey: this._compositeKey,
      localPath: this._localPath,
      localPostfix: this._localPostfix,
      modelName: this._modelName,
      localModelName: this._localModelName || "not-relevant",
      pluralName: this._pluralName,
      watcherPaths,
      // TODO: Fix this typing ... the error is nonsensical atm
      watcherSource: this._watcherSource as any,
      createdAt: new Date().getTime(),
    };

    return watchContext;
  }

  protected getCoreDispatch() {
    // Use the bespoke dispatcher for this class if it's available;
    // if not then fall back to the default Firemodel dispatch
    const coreDispatch = this._dispatcher || FireModel.dispatch;

    if (coreDispatch.name === "defaultDispatch") {
      throw new FireModelError(
        `Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`,
        `firemodel/invalid-dispatch`
      );
    }
    return coreDispatch;
  }

  protected get db(): IAbstractedDatabase {
    if (!this._db) {
      if (FireModel.defaultDb) {
        this._db = FireModel.defaultDb;
      }
    }
    return this._db;
  }
}
