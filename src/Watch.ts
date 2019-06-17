import {
  epochWithMilliseconds,
  IDictionary,
  Omit,
  createError
} from "common-types";
import { Model } from "./Model";
import { SerializedQuery } from "serialized-query";
import { IReduxDispatch } from "./VuexWrapper";
import { FireModel } from "./FireModel";
import { Record } from "./Record";
type RealTimeDB = import("abstracted-firebase").RealTimeDB;
import { WatchDispatcher } from "./Watch/WatchDispatcher";
import { List } from "./List";
import {
  IModelOptions,
  IComparisonOperator,
  FmModelConstructor
} from "./@types/general";
import { IPrimaryKey, ICompositeKey } from "./@types/record-types";
import { FmEvents, IFmDispatchWatchContext } from "./state-mgmt";
import { getAllPropertiesFromClassStructure } from "./util";
import {
  IWatcherItem,
  IWatchListQueries,
  IWatchEventClassification,
  IFmWatcherStartOptions
} from "./Watch/types";
import {
  waitForInitialization,
  hasInitialized
} from "./Watch/watchInitialization";
import { FireModelError } from "./errors";

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherItem> = {};

export class Watch<T extends Model = Model> {
  public static set defaultDb(db: RealTimeDB) {
    FireModel.defaultDb = db;
  }

  public static set dispatch(d: IReduxDispatch) {
    FireModel.dispatch = d;
  }

  /** returns a full list of all watchers */
  public static get inventory() {
    return watcherPool;
  }

  public static toJSON() {
    return Watch.inventory;
  }

  /**
   * lookup
   *
   * Allows the lookup of details regarding the actively watched
   * objects in the Firebase database
   *
   * @param hashCode the unique hashcode given for each watcher
   */
  public static lookup(hashCode: string): IWatcherItem {
    const codes = new Set(Object.keys(watcherPool));
    if (!codes.has(hashCode)) {
      const e = new Error(
        `You looked up an invalid watcher hashcode [${hashCode}].`
      );
      e.name = "FireModel::InvalidHashcode";
      throw e;
    }
    return watcherPool[hashCode];
  }

  public static get watchCount() {
    return Object.keys(watcherPool).length;
  }

  public static reset() {
    watcherPool = {};
  }

  /**
   * Finds the watcher by a given name and returns the ID of the
   * first match
   */
  public static findByName(name: string) {
    return Object.keys(watcherPool).find(
      i => watcherPool[i].watcherName === name
    );
  }

  /** stops watching either a specific watcher or ALL if no hash code is provided */
  public static stop(hashCode?: string, oneOffDB?: RealTimeDB) {
    const codes = new Set(Object.keys(watcherPool));
    const db = oneOffDB || FireModel.defaultDb;
    if (!db) {
      throw new FireModelError(
        `There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`,
        `firemodel/no-database`
      );
    }
    if (hashCode && !codes.has(hashCode)) {
      const e = new FireModelError(
        `The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`
      );
      e.name = "firemodel/missing-hashcode";
      throw e;
    }

    if (!hashCode) {
      db.unWatch();
      watcherPool = {};
    } else {
      const registry = watcherPool[hashCode];
      db.unWatch(
        registry.eventType === "child"
          ? "value"
          : ["child_added", "child_changed", "child_moved", "child_removed"],
        registry.dispatch
      );
      delete watcherPool[hashCode];
    }
  }

  /**
   * Configures the watcher to be a `value` watcher on Firebase
   * which is only concerned with changes to a singular Record.
   *
   * @param pk the _primary key_ for a given record. This can be a string
   * represention of the `id` property, a string represention of
   * the composite key, or an object representation of the composite
   * key.
   */
  public static record<T extends Model>(
    modelConstructor: new () => T,
    pk: IPrimaryKey<T>,
    options: IModelOptions = {}
  ) {
    if (!pk) {
      throw new FireModelError(
        `Attempt made to watch a RECORD but no primary key was provided!`,
        "firemodel/no-pk"
      );
    }
    const o = new Watch();
    if (o.db) {
      o._db = options.db;
    }
    o._eventType = "value";
    o._watcherSource = "record";

    const r = Record.createWith(modelConstructor, pk);

    o._query = new SerializedQuery(`${r.dbPath}`);
    o._modelConstructor = modelConstructor;
    o._modelName = r.modelName;
    o._localModelName = r.META.localModelName;
    o._pluralName = r.pluralName;
    o._localPath = r.localPath;
    o._localPostfix = r.META.localPostfix;
    o._dynamicProperties = r.dynamicPathComponents;

    return o as Omit<Watch, IWatchListQueries | "toString">;
  }

  public static list<T extends Model>(
    modelConstructor: new () => T,
    options: IModelOptions = {}
  ) {
    const o = new Watch<T>();
    if (options.db) {
      o._db = options.db;
    }
    o._eventType = "child";
    o._watcherSource = "list";
    const lst = List.create(modelConstructor);
    o._modelConstructor = modelConstructor;
    o._query = new SerializedQuery<T>(lst.dbPath);
    o._modelName = lst.modelName;
    o._pluralName = lst.pluralName;
    o._localPath = lst.localPath;
    o._classProperties = getAllPropertiesFromClassStructure(
      new o._modelConstructor()
    );
    o._localPostfix = lst.localPostfix;
    o._dynamicProperties = Record.dynamicPathProperties(modelConstructor);
    return o as Pick<Watch, IWatchListQueries>;
  }

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
  protected _watcherSource: "record" | "list";
  protected _classProperties: string[];

  /**
   * **start**
   *
   * executes the watcher so that it becomes actively watched
   */
  public async start(
    options: IFmWatcherStartOptions = {}
  ): Promise<IWatcherItem> {
    const watcherId = "w" + String(this._query.hashCode());
    const watcherName = options.name;
    // create a dispatch function with context
    const context: IFmDispatchWatchContext<T> = {
      watcherId,
      watcherName,
      modelConstructor: this._modelConstructor,
      query: this._query,
      dynamicPathProperties: this._dynamicProperties,
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
        `Attempt to start a ${this._watcherSource} watcher on "${
          this._query.path
        }" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`,
        `firemodel/invalid-dispatch`
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
      return;
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

    watcherPool[watcherId] = watcherItem;
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
  public dispatch(
    d: IReduxDispatch
  ): Omit<Watch, IWatchListQueries | "toString" | "dispatch"> {
    this._dispatcher = d;
    return this;
  }

  /**
   * **since**
   *
   * Watch for all records that have changed since a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public since(
    when: epochWithMilliseconds | string,
    limit?: number
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("lastUpdated").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this;
  }

  /**
   * **dormantSince**
   *
   * Watch for all records that have NOT changed since a given date (opposite of "since")
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public dormantSince(
    when: epochWithMilliseconds | string,
    limit?: number
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("lastUpdated").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this;
  }

  /**
   * **after**
   *
   * Watch all records that were created after a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public after(
    when: epochWithMilliseconds | string,
    limit?: number
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("createdAt").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this;
  }

  /**
   * **before**
   *
   * Watch all records that were created before a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public before(
    when: epochWithMilliseconds | string,
    limit?: number
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("createdAt").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this;
  }

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
  public first(
    howMany: number,
    startAt?: string
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("createdAt").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }

    return this;
  }

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
  public last(
    howMany: number,
    startAt?: string
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("createdAt").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }

    return this;
  }

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
  public recent(
    howMany: number,
    startAt?: string
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("lastUpdated").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }

    return this;
  }

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
  public inactive(
    howMany: number,
    startAt?: string
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = this._query.orderByChild("lastUpdated").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }

    return this;
  }

  /**
   * **fromQuery**
   *
   * Watch for all records that conform to a passed in query
   *
   * @param query
   */
  public fromQuery(
    inputQuery: SerializedQuery
  ): Omit<Watch, IWatchListQueries | "toString"> {
    this._query = inputQuery;

    return this;
  }

  /**
   * **all**
   *
   * Watch for all records of a given type
   *
   * @param limit it you want to limit the results a max number of records
   */
  public all(limit?: number): Omit<Watch, IWatchListQueries | "toString"> {
    if (limit) {
      this._query = this._query.limitToLast(limit);
    }
    return this;
  }

  /**
   * **where**
   *
   * Watch for all records where a specified property is
   * equal, less-than, or greater-than a certain value
   *
   * @param property the property which the comparison operater is being compared to
   * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
   */
  public where<K extends keyof T>(
    property: K,
    value: T[K] | [IComparisonOperator, T[K]]
  ): Omit<Watch, IWatchListQueries | "toString"> {
    let operation: IComparisonOperator = "=";
    let val;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    } else {
      val = value;
    }
    this._query = new SerializedQuery<T>(this._query.path)
      .orderByChild(property)
      .where(operation, val);
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

export interface IWatcherApiPostQuery {
  /** executes the watcher so that it becomes actively watched */
  start: () => void;
  dispatch: IReduxDispatch;
}
