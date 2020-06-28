import {
  IComparisonOperator,
  ISerializedQuery,
  SerializedQuery,
} from "universal-fire";
import { IListOptions, IModel, IPrimaryKey } from "@/types";
import { List, Record, Watch } from "@/core";

import { FireModelError } from "@/errors";
import { WatchBase } from "./WatchBase";
import { epochWithMilliseconds } from "common-types";
import { getAllPropertiesFromClassStructure } from "@/util";

export class WatchList<T extends IModel> extends WatchBase<T> {
  public static list<T extends IModel>(
    /**
     * The `Model` underlying the **List**
     */
    modelConstructor: new () => T,
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    options: IListOptions<T> = {}
  ): WatchList<T> {
    const obj = new WatchList<T>();
    obj.list(modelConstructor, options);
    return obj;
  }

  protected _offsets: Partial<T> = {};
  protected _options: IListOptions<T> = {};

  public list(
    modelConstructor: new () => T,
    options: IListOptions<T> = {}
  ): WatchList<T> {
    this._watcherSource = "list";
    this._eventType = "child";
    this._options = options;

    if (options.offsets) {
      this._offsets = options.offsets;
    }

    const lst = List.create(modelConstructor, options);
    this._modelConstructor = modelConstructor;
    this._classProperties = getAllPropertiesFromClassStructure(
      new this._modelConstructor()
    );
    this._dynamicProperties = Record.dynamicPathProperties(modelConstructor);
    this.setPathDependantProperties();

    return this;
  }

  /**
   *
   * @param offsetDict
   */
  public offsets(offsetDict: Partial<T>) {
    this._offsets = offsetDict;
    const lst = List.create(this._modelConstructor, this._options);
    this.setPathDependantProperties();

    return this;
  }

  /**
   * **ids**
   *
   * There are times where you know an array of IDs which you want to watch as a `list`
   * and calling a series of **record** watchers would not work because -- for a given model
   * -- you can only watch one (this is due to the fact that a _record_ watcher does not
   * offset the record by it's ID). This is the intended use-case for this type of _list_
   * watcher.
   *
   * It is worth noting that with this watcher the frontend will indeed get an array of
   * records but from a **Firebase** standpoint this is not a "list watcher" but instead
   * a series of "record watchers".
   *
   * @param ids the list of FK references (simple or composite)
   */
  public ids(...ids: Array<IPrimaryKey<T>>) {
    if (ids.length === 0) {
      throw new FireModelError(
        `You attempted to setup a watcher list on a given set of ID's of "${this._modelName}" but the list of ID's was empty!`,
        "firemodel/not-ready"
      );
    }
    for (const id of ids) {
      this._underlyingRecordWatchers.push(
        this._options.offsets
          ? Watch.record<T>(this._modelConstructor, {
              ...(typeof id === "string" ? { id } : id),
              ...this._options.offsets,
            })
          : Watch.record<T>(this._modelConstructor, id)
      );
    }
    this._watcherSource = "list-of-records";
    this._eventType = "value";

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
  ): WatchList<T> {
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
  ): WatchList<T> {
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
  ): WatchList<T> {
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
  ): WatchList<T> {
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
  public first(howMany: number, startAt?: string): WatchList<T> {
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
  public last(howMany: number, startAt?: string): WatchList<T> {
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
  public recent(howMany: number, startAt?: string): WatchList<T> {
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
  public inactive(howMany: number, startAt?: string): WatchList<T> {
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
  public fromQuery(inputQuery: ISerializedQuery<T>): WatchList<T> {
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
  public all(limit?: number): WatchList<T> {
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
    property: K & string,
    value: T[K] | [IComparisonOperator, T[K]]
  ): WatchList<T> {
    let operation: IComparisonOperator = "=";
    let val;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    } else {
      val = value;
    }
    this._query = SerializedQuery.create<T>(this.db, this._query.path)
      .orderByChild(property)
      // TODO: fix typing issue here.
      // @ts-ignore
      .where(operation, val);
    return this;
  }

  /**
   * Sets properties that could be effected by _dynamic paths_
   */
  protected setPathDependantProperties() {
    if (
      this._dynamicProperties.length === 0 ||
      Object.keys(this._offsets).length > 0
    ) {
      const lst = List.create(this._modelConstructor, {
        ...this._options,
        offsets: this._offsets,
      });

      this._query = SerializedQuery.create<T>(this.db, lst.dbPath);
      this._modelName = lst.modelName;
      this._pluralName = lst.pluralName;
      this._localPath = lst.localPath;
      this._localPostfix = lst.localPostfix;
    }
  }
}
