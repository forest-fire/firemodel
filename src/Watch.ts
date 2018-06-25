import { epochWithMilliseconds, pathJoin, IDictionary } from "common-types";
import {
  FMModelConstructor,
  Model,
  IComparisonOperator,
  IModelOptions
} from "./Model";
import { SerializedQuery } from "serialized-query";
import { IReduxAction, IReduxDispatch } from "./VuexWrapper";
import { FireModel } from "./FireModel";
import { Record } from "./Record";
import { WSAENETUNREACH } from "constants";
import { RealTimeDB } from "../node_modules/abstracted-admin/dist/esnext";
import { ModelDispatchTransformer } from "./ModelDispatchTransformer";
import { List } from "./List";
import { watch } from "fs";

export type IWatchEventClassification = "child" | "value";
export type IQuerySetter = (q: SerializedQuery) => void;

export interface IWatcherItem {
  eventType: string;
  query: SerializedQuery;
  createdAt: number;
  dispatch: IReduxDispatch;
  dbPath: string;
}

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherItem> = {};

export class Watch {
  public static set defaultDb(db: RealTimeDB) {
    FireModel.defaultDb = db;
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

  public static stop(hashCode?: string, oneOffDB?: RealTimeDB) {
    const codes = new Set(Object.keys(watcherPool));
    const db = oneOffDB || FireModel.defaultDb;
    if (!db) {
      const e = new Error(
        `There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`
      );
      e.name = "FireModel::NoDatabase";
      throw e;
    }
    if (hashCode && !codes.has(hashCode)) {
      const e = new Error(
        `The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`
      );
      e.name = "FireModel::Forbidden";
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

  public static record<T extends Model>(
    modelClass: new () => T,
    recordId: string,
    options: IModelOptions = {}
  ) {
    const o = new Watch();
    if (o.db) {
      o._db = options.db;
    }
    o._eventType = "value";
    const r = Record.create(modelClass);
    r._initialize({ id: recordId } as any);
    o._query = new SerializedQuery(`${r.dbPath}`);
    o._modelName = r.modelName;
    o._pluralName = r.pluralName;
    o._localPath = r.localPath;

    return o.apiPostQuery(o);
  }

  public static list<T extends Model>(
    modelConstructor: new () => T,
    options: IModelOptions = {}
  ) {
    const o = new Watch();
    if (options.db) {
      o._db = options.db;
    }
    o._eventType = "child";
    const lst = List.create(modelConstructor);
    o._query = new SerializedQuery(lst.dbPath);
    o._modelName = lst.modelName;
    o._pluralName = lst.pluralName;
    o._localPath = lst.localPath;
    return o.apiList(o);
  }

  protected _query: SerializedQuery;
  protected _eventType: IWatchEventClassification;
  protected _dispatcher: IReduxDispatch;
  protected _db: RealTimeDB;
  protected _modelName: string;
  protected _pluralName: string;
  protected _localPath: string;

  public start() {
    const hash = "w" + String(this._query.hashCode());

    const dispatch = ModelDispatchTransformer({
      watcherHash: hash,
      watcherDbPath: this._query.path as string,
      watcherLocalPath: this._localPath,
      modelName: this._modelName,
      pluralName: this._pluralName
    })(this._dispatcher || FireModel.dispatch);

    if (this._eventType === "value") {
      this.db.watch(this._query, "value", dispatch);
    } else {
      this.db.watch(
        this._query,
        ["child_added", "child_changed", "child_moved", "child_removed"],
        dispatch
      );
    }

    watcherPool[hash] = {
      eventType: this._eventType,
      dispatch: this._dispatcher,
      query: this._query,
      dbPath: this._query.path as string,
      createdAt: new Date().getTime()
    };

    return hash;
  }

  public dispatch(d: IReduxDispatch) {
    this._dispatcher = d;
    return this.apiStartOnly(this);
  }
  /**
   * since
   *
   * Watch for all records that have changed since a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public since(when: epochWithMilliseconds | string, limit?: number) {
    this._query = this._query.orderByChild("lastUpdated").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this.apiPostQuery(this);
  }

  /**
   * dormantSince
   *
   * Watch for all records that have NOT changed since a given date (opposite of "since")
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public dormantSince(when: epochWithMilliseconds | string, limit?: number) {
    this._query = this._query.orderByChild("lastUpdated").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this.apiPostQuery(this);
  }

  /**
   * after
   *
   * Watch all records that were created after a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public after(when: epochWithMilliseconds | string, limit?: number) {
    this._query = this._query.orderByChild("createdAt").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this.apiPostQuery(this);
  }

  /**
   * before
   *
   * Watch all records that were created before a given date
   *
   * @param when  the datetime in milliseconds or a string format that works with new Date(x)
   * @param limit  optionally limit the records returned to a max number
   */
  public before(when: epochWithMilliseconds | string, limit?: number) {
    this._query = this._query.orderByChild("createdAt").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }

    return this.apiPostQuery(this);
  }

  /**
   * first
   *
   * Watch for a given number of records; starting with the first/earliest records (createdAt).
   * Optionally you can state an ID from which to start from. This is useful for a pagination
   * strategy.
   *
   * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
   * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
   */
  public first(howMany: number, startAt?: string) {
    this._query = this._query.orderByChild("createdAt").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }

    return this.apiPostQuery(this);
  }

  /**
   * last
   *
   * Watch for a given number of records; starting with the last/most-recently added records
   * (e.g., createdAt). Optionally you can state an ID from which to start from.
   * This is useful for a pagination strategy.
   *
   * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
   * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
   */
  public last(howMany: number, startAt?: string) {
    this._query = this._query.orderByChild("createdAt").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }

    return this.apiPostQuery(this);
  }

  /**
   * recent
   *
   * Watch for a given number of records; starting with the recent/most-recently updated records
   * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
   * This is useful for a pagination strategy.
   *
   * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
   * @param startAt  the ID reference to a record in the list (if used for pagination, add the recent record in the list to this value)
   */
  public recent(howMany: number, startAt?: string) {
    this._query = this._query.orderByChild("lastUpdated").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }

    return this.apiPostQuery(this);
  }

  /**
   * inactive
   *
   * Watch for a given number of records; starting with the inactive/most-inactively added records
   * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
   * This is useful for a pagination strategy.
   *
   * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
   * @param startAt  the ID reference to a record in the list (if used for pagination, add the inactive record in the list to this value)
   */
  public inactive(howMany: number, startAt?: string) {
    this._query = this._query.orderByChild("lastUpdated").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }

    return this.apiPostQuery(this);
  }

  /**
   * fromQuery
   *
   * Watch for all records that conform to a passed in query
   *
   * @param query
   */
  public fromQuery<T extends Model>(inputQuery: SerializedQuery) {
    this._query = inputQuery;

    return this.apiPostQuery(this);
  }

  /**
   * all
   *
   * Watch for all records of a given type
   *
   * @param limit it you want to limit the results a max number of records
   */
  public all(limit?: number) {
    if (limit) {
      this._query = this._query.limitToLast(limit);
    }
    return this.apiPostQuery(this);
  }

  /**
   * where
   *
   * Watch for all records where a specified property is
   * equal, less-than, or greater-than a certain value
   *
   * @param property the property which the comparison operater is being compared to
   * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
   */
  public where<T extends Model, K extends keyof T>(
    property: K,
    value: T[K] | [IComparisonOperator, T[K]]
  ) {
    let operation: IComparisonOperator = "=";
    let val = value;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    }
    return this.apiPostQuery(this);
  }

  public toString() {
    return `Watching path "${this._query.path}" for "${
      this._eventType
    }" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
  }

  protected get db() {
    if (!this._db) {
      if (FireModel.defaultDb) {
        this._db = FireModel.defaultDb;
      }
    }
    return this._db;
  }

  protected apiList(context: IDictionary) {
    return {
      all: this.all.bind(context),
      since: this.since.bind(context),
      first: this.first.bind(context),
      last: this.last.bind(context),
      recent: this.recent.bind(context),
      inactive: this.inactive.bind(context),
      where: this.where.bind(context),
      fromQuery: this.fromQuery.bind(context)
    };
  }

  protected apiPostQuery(context: IDictionary) {
    return {
      start: this.start.bind(context),
      dispatch: this.dispatch.bind(context)
    };
  }

  protected apiStartOnly(context: IDictionary) {
    return {
      start: this.start.bind(context)
    };
  }
}
