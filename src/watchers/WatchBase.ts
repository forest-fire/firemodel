import { Model } from "../Model";
import { SerializedQuery } from "serialized-query";
import { FmModelConstructor, ICompositeKey } from "../@types";
import {
  IWatchEventClassification,
  IFmWatcherStartOptions,
  IWatcherItem
} from "./types";
import { IReduxDispatch } from "../VuexWrapper";
import { RealTimeDB } from "abstracted-firebase";
import { IFmDispatchWatchContext, FireModel, FmEvents } from "..";
import { FireModelError } from "../errors";
import { WatchDispatcher } from "./WatchDispatcher";
import { waitForInitialization } from "./watchInitialization";
import { createError } from "common-types";
import { addToWatcherPool } from "./watcherPool";

/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
export class WatchBase<T extends Model> {
  protected _query: SerializedQuery;
  protected _modelConstructor: FmModelConstructor<any>;
  protected _eventType: IWatchEventClassification;
  protected _dispatcher: IReduxDispatch;
  protected _db: RealTimeDB;
  protected _modelName: string;
  protected _localModelName: string;
  protected _pluralName: string;
  protected _localPath: string;
  protected _localPostfix: string;
  protected _dynamicProperties: string[];
  protected _compositeKey: ICompositeKey<T>;
  protected _watcherSource: "record" | "list";
  protected _classProperties: string[];

  /**
   * **start**
   *
   * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
   * actively watched
   */
  public async start(
    options: IFmWatcherStartOptions = {}
  ): Promise<IWatcherItem> {
    const watcherId = "w" + String(this._query.hashCode());
    const watcherName = options.name || `not-specified-${watcherId}`;
    // create a dispatch function with context
    const context: IFmDispatchWatchContext<T> = {
      watcherId,
      watcherName,
      modelConstructor: this._modelConstructor,
      query: this._query,
      dynamicPathProperties: this._dynamicProperties,
      compositeKey: this._compositeKey,
      localPath: this._localPath,
      localPostfix: this._localPostfix,
      modelName: this._modelName,
      localModelName: this._localModelName || "not-relevant",
      pluralName: this._pluralName,
      watcherPath: this._query.path as string,
      watcherSource: this._watcherSource
    };
    const coreDispatch = this._dispatcher || FireModel.dispatch;

    if (coreDispatch.name === "defaultDispatch") {
      throw new FireModelError(
        `Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`,
        `firemodel/invalid-dispatch`
      );
    }

    if (!this.db) {
      throw new FireModelError(
        `Attempt to start a watcher before the database connection has been established!`
      );
    }
    const dispatchCallback = WatchDispatcher<T>(context)(coreDispatch);

    try {
      if (this._eventType === "value") {
        this.db.watch(this._query, ["value"], dispatchCallback);
      } else {
        this.db.watch(
          this._query,
          ["child_added", "child_changed", "child_moved", "child_removed"],
          dispatchCallback
        );
      }
    } catch (e) {
      console.log(`Problem starting watcher [${watcherId}]: `, e);
      (this._dispatcher || FireModel.dispatch)({
        type: FmEvents.WATCHER_FAILED,
        errorMessage: e.message,
        errorCode: e.code || e.name || "firemodel/watcher-failed"
      });
      throw e;
    }

    const watcherItem: IWatcherItem = {
      watcherId,
      watcherName,
      eventType: this._eventType,
      watcherSource: this._watcherSource,
      dispatch: this._dispatcher || FireModel.dispatch,
      query: this._query,
      dbPath: this._query.path as string,
      localPath: this._localPath,
      createdAt: new Date().getTime()
    };

    addToWatcherPool(watcherItem);

    // dispatch meta
    (this._dispatcher || FireModel.dispatch)({
      type: FmEvents.WATCHER_STARTING,
      ...watcherItem
    });
    try {
      await waitForInitialization(watcherItem);

      (this._dispatcher || FireModel.dispatch)({
        type: FmEvents.WATCHER_STARTED,
        ...watcherItem
      });

      return watcherItem;
    } catch (e) {
      throw createError(
        "firemodel/watcher-initialization",
        `The watcher "${watcherId}" failed to initialize`
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

  protected get db(): RealTimeDB {
    if (!this._db) {
      if (FireModel.defaultDb) {
        this._db = FireModel.defaultDb;
      }
    }
    return this._db;
  }
}
