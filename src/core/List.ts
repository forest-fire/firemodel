import { FireModel, Record } from "@/core";
import {
  IAbstractedDatabase,
  IComparisonOperator,
  ISerializedQuery,
  SerializedQuery,
} from "universal-fire";
import {
  IDictionary,
  epochWithMilliseconds,
  ConstructorFor,
  datetime,
  datestring,
} from "common-types";
import {
  IFmQueryDefn,
  IListOptions,
  IListQueryOptions,
  IModel,
  IPrimaryKey,
  IReduxDispatch,
} from "@/types";
import { capitalize, getModelMeta, pathJoin } from "@/util";

import { FireModelError } from "@/errors";
import { arrayToHash } from "typed-conversions";
import { queryAdjustForNext, reduceOptionsForQuery } from "./lists";

const DEFAULT_IF_NOT_FOUND = Symbol("DEFAULT_IF_NOT_FOUND");

function addTimestamps<T extends IModel>(obj: IDictionary) {
  const datetime = new Date().getTime();
  const output: IDictionary = {};
  Object.keys(obj).forEach((i) => {
    output[i] = {
      ...obj[i],
      createdAt: datetime,
      lastUpdated: datetime,
    };
  });

  return output as T;
}
export class List<T extends IModel> extends FireModel<T> {
  //#region STATIC Interfaces

  /**
   * Sets the default database to be used by all FireModel classes
   * unless explicitly told otherwise
   */
  public static set defaultDb(db: IAbstractedDatabase) {
    FireModel.defaultDb = db;
  }

  public static get defaultDb() {
    return FireModel.defaultDb;
  }

  // TODO: should `set` be removed?
  /**
   * **set**
   *
   * Sets a given model to the payload passed in. This is
   * a destructive operation ... any other records of the
   * same type that existed beforehand are removed.
   */
  public static async set<T extends IModel>(
    model: ConstructorFor<T>,
    payload: IDictionary<T>,
    options: IListOptions<T> = {}
  ) {
    try {
      const m = Record.create(model, options);
      // If Auditing is one we must be more careful
      if (m.META.audit) {
        const existing = await List.all(model, options);
        if (existing.length > 0) {
          // TODO: need to write an appropriate AUDIT EVENT
          // TODO: implement
        } else {
          // LIST_SET event
          // TODO: need to write an appropriate AUDIT EVENT
          // TODO: implement
        }
      } else {
        // Without auditing we can just set the payload into the DB
        const datetime = new Date().getTime();
        await FireModel.defaultDb.set(
          `${m.META.dbOffset}/${m.pluralName}`,
          addTimestamps(payload)
        );
      }

      const current = await List.all(model, options);
      return current;
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${e.message}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }
  }

  /**
   * Set the default dispatch function
   */
  public static set dispatch(fn: IReduxDispatch) {
    FireModel.dispatch = fn;
  }

  public static create<T extends IModel>(
    model: ConstructorFor<T>,
    options?: IListOptions<T>
  ) {
    return new List<T>(model, options);
  }

  /**
   * Creates a List<T> which is populated with the passed in query
   *
   * @param schema the schema type
   * @param query the serialized query; note that this LIST will override the path of the query
   * @param options model options
   */
  public static async fromQuery<T extends IModel>(
    model: ConstructorFor<T>,
    query: ISerializedQuery<T>,
    options: IListOptions<T> = {}
  ): Promise<List<T>> {
    const list = List.create(model, options);

    const path =
      options && options.offsets
        ? List.dbPath(model, options.offsets)
        : List.dbPath(model);

    query.setPath(path);

    return list._loadQuery(query);
  }

  /**
   * **query**
   *
   * Allow connecting any valid Firebase query to the List object
   */
  public static async query<T extends IModel>(
    model: ConstructorFor<T>,
    query: IFmQueryDefn<T>,
    options: IListQueryOptions<T> = {}
  ) {
    const db = options.db || FireModel.defaultDb;
    if (!db) {
      throw new FireModelError(
        `Attempt to query database with List before setting a database connection! Either set a default database or explicitly add the DB connection to queries.`,
        "not-allowed"
      );
    }

    const path =
      options && options.offsets
        ? List.dbPath(model, options.offsets)
        : List.dbPath(model);
    const q = SerializedQuery.create<T>(db, path);
    const list = List.create(model, options);
    if (options.paginate) {
      list._pageSize = options.paginate;
    }

    return list._loadQuery(query(q));
  }

  /**
   * Loads all the records of a given Model.
   *
   * **Note:** will order results by `lastUpdated` unless
   * an `orderBy` property is passed into the options hash.
   */
  public static async all<T extends IModel>(
    model: ConstructorFor<T>,
    options: IListOptions<T> = {}
  ): Promise<List<T>> {
    return List.query<T>(
      model,
      (q) => {
        q.orderByChild(options.orderBy || "lastUpdated");
        if (options.limitToFirst) q.limitToFirst(options.limitToFirst);
        if (options.limitToLast) q.limitToLast(options.limitToLast);
        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * Loads the first X records of the Schema type where
   * ordering is provided by the "createdAt" property
   *
   * @param model the model type
   * @param howMany the number of records to bring back
   * @param options model options
   */
  public static async first<T extends IModel>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<T>,
      "limitToFirst" | "limitToLast" | "startAt" | "orderBy"
    > = {}
  ): Promise<List<T>> {
    return List.query<T>(
      model,
      (q) => {
        q.orderByChild("createdAt").limitToLast(howMany);
        if (options.paginate && options.endAt) {
          console.info(
            `Call to List.first(${capitalize(
              model.constructor.name
            )}, ${howMany}) set the option to paginate AND set a value to 'endAt'. This is typically not done but may be fine.`
          );
        }
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * recent
   *
   * Get a discrete number of records which represent the most _recently_
   * updated records (uses the `lastUpdated` property on the model).
   */
  public static async recent<T extends IModel>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<T>,
      "limitToFirst" | "limitToLast" | "orderBy" | "endAt"
    > = {}
  ): Promise<List<T>> {
    return List.query<T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").limitToFirst(howMany);

        if (options.paginate && options.startAt) {
          console.info(
            `Call to List.recent(${capitalize(
              model.constructor.name
            )}, ${howMany}) set the option to paginate AND set a value to 'startAt'. This is typically not done but may be fine.`
          );
        }
        if (options.startAt) q.startAt(options.startAt);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * **since**
   *
   * Brings back all records that have changed since a given date
   * (using `lastUpdated` field)
   */
  public static async since<T extends IModel>(
    model: ConstructorFor<T>,
    since: epochWithMilliseconds | datetime | datestring | Date,
    options: Omit<IListOptions<T>, "startAt" | "endAt" | "orderBy"> = {}
  ): Promise<List<T>> {
    switch (typeof since) {
      case "string":
        since = new Date(since).getTime();
        break;
      case "object":
        if (!(since instanceof Date)) {
          throw new FireModelError(
            `Call to List.since(${capitalize(
              model.constructor.name
            )}) failed as the since parameter was of an unrecognized type (an object but not a Date)`,
            "invalid-request"
          );
        }
        since = since.getTime();
        break;
      case "number":
        // nothing to do
        break;
      default:
        throw new FireModelError(
          `Call to List.since(${capitalize(
            model.constructor.name
          )}) failed because the since parameter was of the wrong type [ ${typeof since} ]`,
          "invalid-request"
        );
    }

    return List.query<T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").startAt(since);
        if (options.limitToFirst) q.startAt(options.limitToFirst);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * **List.inactive()**
   *
   * provides a way to sort out the "x" _least active_ records where
   * "least active" means that their `lastUpdated` property has gone
   * without any update for the longest.
   */
  public static async inactive<T extends IModel>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<T>,
      "limitToLast" | "limitToFirst" | "orderBy"
    > = {}
  ): Promise<List<T>> {
    return List.query<T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").limitToLast(howMany);
        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.startAt);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * **last**
   *
   * Lists the last _x_ items of a given model where "last" refers to the datetime
   * that the record was **created**.
   */
  public static async last<T extends IModel>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<IListOptions<T>, "orderBy"> = {}
  ): Promise<List<T>> {
    return List.query<T>(
      model,
      (q) => {
        q.orderByChild("createdAt").limitToFirst(howMany);

        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * **findWhere**
   *
   * Runs a `List.where()` search and returns the first result as a _model_
   * of type `T`. If no results were found it returns `undefined`.
   */
  public static async findWhere<T extends IModel, K extends keyof T>(
    model: ConstructorFor<T>,
    property: K & string,
    value: T[K] | [IComparisonOperator, T[K]],
    options: IListOptions<T> = {}
  ) {
    if (property === "id" && !Array.isArray(value)) {
      const modelName = capitalize(model.constructor.name);
      console.warn(
        `you used List.find(${modelName}, "id", ${value} ) this will be converted to Record.get(${modelName}, ${value}). The List.find() command should be used for properties other than "id"; please make a note of this and change your code accordingly!`
      );
      return Record.get(model, (value as unknown) as string);
    }
    const results = await List.where(model, property, value, options);
    return results.length > 0 ? results.data[0] : undefined;
  }

  /**
   * Puts an array of records into Firemodel as one operation; this operation
   * is only available to those who are using the Admin SDK/API.
   */
  public static async bulkPut<T extends IModel>(
    model: ConstructorFor<T>,
    records: T[] | IDictionary<T>,
    options: IListOptions<T> = {}
  ) {
    if (!FireModel.defaultDb.isAdminApi) {
      throw new FireModelError(
        `You must use the Admin SDK/API to use the bulkPut feature. This may change in the future but in part because the dispatch functionality is not yet set it is restricted to the Admin API for now.`
      );
    }

    if (Array.isArray(records)) {
      records = arrayToHash<T>(records);
    }

    const dbPath = List.dbPath(model, options.offsets);
    const db = options.db || FireModel.defaultDb;
    await db.update(dbPath, records);
  }

  /**
   * **List.where()**
   *
   * A static inializer which give you a list of all records of a given model
   * which meet a given logical condition. This condition is executed on the
   * **Firebase** side and a `List` -- even if no results met the criteria --
   * is returned.
   *
   * **Note:** the default comparison operator is **equals** but you can
   * override this default by adding a _tuple_ to the `value` where the first
   * array item is the operator, the second the value you are comparing against.
   */
  public static async where<T extends IModel, K extends keyof T>(
    model: ConstructorFor<T>,
    property: K & string,
    value: T[K] | [IComparisonOperator, T[K]],
    options: Omit<IListOptions<T>, "orderBy" | "startAt" | "endAt"> = {}
  ) {
    let operation: IComparisonOperator = "=";
    let val = value;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    }

    return List.query<T>(
      model,
      (q) => {
        q.orderByChild(property);
        q.where(operation, val);

        if (options.limitToFirst) q.limitToFirst(options.limitToFirst);
        if (options.limitToLast) q.limitToLast(options.limitToLast);

        return q;
      },
      reduceOptionsForQuery<T>(options)
    );
  }

  /**
   * Get's a _list_ of records. The return object is a `List` but the way it is composed
   * doesn't actually do a query against the database but instead it just takes the array of
   * `id`'s passed in,
   *
   * **Note:** the term `ids` is not entirely accurate, it should probably be phrased as `fks`
   * because the "id" can be any form of `ICompositeKey` as well just a plain `id`. The naming
   * here is just to retain consistency with the **Watch** api.
   *
   * `removed` COMMENT
   */
  public static async ids<T extends IModel>(
    model: ConstructorFor<T>,
    ...fks: IPrimaryKey<T>[]
  ) {
    const promises: any[] = [];
    const results: T[] = [];
    const errors: Array<{ error: FireModelError; id: IPrimaryKey<T> }> = [];
    fks.forEach((id) => {
      promises.push(
        Record.get(model, id)
          .then((p) => results.push(p.data))
          .catch((error) => errors.push({ error, id }))
      );
    });
    await Promise.all(promises);
    // if error resulted from record not existing; this should NOT be seen as
    // an error but all other errors will
    if (errors.length > 0) {
      if (
        errors.every(
          (err) => !err.error.code || err.error.code !== "no-record-found"
        )
      ) {
        const realErrors = errors.filter(
          (err) => !err.error.code || err.error.code !== "no-record-found"
        );
        const emptyResults = errors.filter(
          (err) => err.error.code && err.error.code === "no-record-found"
        );

        const errorOverview = errors
          .map((i) => `[ ${JSON.stringify(i.id)}]: ${i.error.message}`)
          .join("\n");
        if (results.length > 0) {
          throw new FireModelError(
            `While calling List.ids(${capitalize(
              model.name
            )}, ...) all of the ids requested failed. Structured versions of these errors can be found in the "errors" properoty but here is a summary of the error messages recieved:\n\n${errorOverview}`,
            "failure-of-list-ids",
            errors
          );
        }

        throw new FireModelError(
          `While calling List.ids(${capitalize(
            model.name
          )}, ...) there were some successful results but there were error(s) on ${
            realErrors.length
          } of the ${fks.length} requested records.${
            emptyResults.length > 0
              ? `There were also ${emptyResults.length} records which came back with empty results (which may be fine). Structured versions of these errors can be found in the "errors" properoty but here is a summary of the error messages recieved:\n\n${errorOverview}`
              : ""
          }`,
          "errors-in-list-ids"
        );
      }
    } else {
    }

    const obj = new List(model);
    obj._data = results;

    return obj;
  }

  /**
   * If you want to just get the `dbPath` of a Model you can call
   * this static method and the path will be returned.
   *
   * **Note:** the optional second parameter lets you pass in any
   * dynamic path segments if that is needed for the given model.
   */
  public static dbPath<T extends IModel, K extends keyof T>(
    model: ConstructorFor<T>,
    offsets?: Partial<T>
  ) {
    const obj = offsets ? List.create(model, { offsets }) : List.create(model);

    return obj.dbPath;
  }

  protected _offsets: Partial<T>;

  //#endregion

  private _data: T[] = [];
  private _query: ISerializedQuery<T>;
  private _options: IListOptions<T>;
  /** the pagination page size; 0 indicates that pagination is not turned on */
  private _pageSize: number = 0;
  private _page: number = 0;
  /** flag indicating if all records have now been retrieved */
  private _paginationComplete: boolean = false;

  constructor(model: ConstructorFor<T>, options: IListOptions<T> = {}) {
    super();
    this._modelConstructor = model;
    this._model = new model();
    this._options = options;
    if (options.db) {
      this._db = options.db;
      if (!FireModel.defaultDb) {
        FireModel.defaultDb = options.db;
      }
    }
    if (options.offsets) {
      this._offsets = options.offsets;
    }
  }

  //#region Getters

  /**
   * The query used in this List instance
   */
  public get query(): ISerializedQuery<T> {
    return this._query;
  }

  public get length(): number {
    return this._data.length;
  }

  /** flag indicating whether pagination is being used on this List instance */
  public get usingPagination(): boolean {
    return this._pageSize > 0 ? true : false;
  }

  /**
   * How many "pages" are loaded from Firebase currently.
   */
  public get pagesLoaded(): Readonly<number> {
    return this.usingPagination ? this._page + 1 : undefined;
  }

  public get pageSize(): Readonly<number> {
    return this.usingPagination ? this._pageSize : undefined;
  }

  public get dbPath() {
    const dbOffset = getModelMeta(this._model).dbOffset;

    return [this._injectDynamicDbOffsets(dbOffset), this.pluralName].join("/");
  }

  /**
   * Gives the path in the client state tree to the beginning
   * where this LIST will reside.
   *
   * Includes `localPrefix` and `pluralName`, but does not include `localPostfix`
   */
  public get localPath() {
    const meta = this._model.META || getModelMeta(this._model);
    return pathJoin(
      meta.localPrefix,
      meta.localModelName !== this.modelName
        ? meta.localModelName
        : this.pluralName
    );
  }

  /**
   * Used with local state management tools, it provides a postfix to the state tree path
   * The default is `all` and it will probably be used in most cases
   *
   * e.g. If the model is called `Tree` then your records will be stored at `trees/all`
   * (assuming the default `all` postfix)
   */
  public get localPostfix() {
    const meta = this._model.META || getModelMeta(this._model);
    return meta.localPostfix;
  }

  //#endregion Getters

  //#region Public API

  /**
   * Load the next _page_ in a paginated query.
   *
   * This function returns an error if the List object is not setup
   * for pagination.
   */
  public async next() {
    if (!this.usingPagination) {
      throw new FireModelError(
        `Attempt to call "List.next()" on a list that is _not_ paginated [ ${capitalize(
          this.modelName
        )} ]`
      );
    }

    this._query = queryAdjustForNext(this._query, this._page);
    this._page++;
    const data = (
      await List.query(
        this._modelConstructor,
        (q) => this._query,
        this._options
      )
    ).data;
    if (data.length < this._pageSize) {
      this._paginationComplete = true;
    }
    this._data = this._data.concat(...data);
  }

  /** Returns another List with data filtered down by passed in filter function */
  public filter(f: ListFilterFunction<T>) {
    const list = List.create(this._modelConstructor);
    list._data = this._data.filter(f);
    return list;
  }

  /**
   * provides a `map` function over the records managed by the List; there
   * will be no mutations to the data managed by the list
   */
  public map<K = any>(f: ListMapFunction<T, K>) {
    return this.data.map(f);
  }

  /**
   * provides a `forEach` function to iterate over the records managed by the List
   */
  public forEach<K = any>(f: ListMapFunction<T, K>) {
    this.data.forEach(f);
  }

  /**
   * runs a `reducer` function across all records in the list
   */
  public reduce<K = any>(f: ListReduceFunction<T, K>, initialValue = {}) {
    return this.data.reduce(f, initialValue);
  }

  public paginate(pageSize: number) {
    this._pageSize = pageSize;
    return this;
  }

  /**
   * Gives access to the List's array of records
   */
  public get data() {
    return this._data;
  }

  /**
   * Gets a `Record<T>` from within the list of items.
   *
   * If you just want the Model's data then use `getData` instead.
   */
  public getRecord(id: string) {
    const found = this.filter((f) => f.id === id);
    if (found.length === 0) {
      throw new FireModelError(
        `Could not find "${id}" in list of ${this.pluralName}`,
        "not-found"
      );
    }

    return Record.createWith(this._modelConstructor, found.data[0]);
  }

  /**
   * Deprecated: use `List.getRecord()`
   */
  public findById(id: string): Record<T> {
    console.warn("List.findById() is deprecated. Use List.get() instead.");
    return this.getRecord(id);
  }

  /**
   * Allows for records managed by this **List** to be removed from the
   * database.
   */
  public async remove(id: string, ignoreOnNotFound: boolean = false) {
    try {
      const rec = this.getRecord(id);
      await rec.remove();
      this._data = this.filter((f) => f.id !== id).data;
    } catch (e) {
      if (!ignoreOnNotFound && e.code === "not-found") {
        throw new FireModelError(
          `Could not remove "${id}" in the supplied List of "${capitalize(
            this.pluralName
          )}" as the ID did not exist!`,
          `firemodel/not-allowed`
        );
      } else {
        throw e;
      }
    }
  }

  /** deprecated ... use List.remove() instead */
  public async removeById(id: string, ignoreOnNotFound: boolean = false) {
    console.log(`List.removeById() is deprecated; use List.remove() instead`);
    return this.remove(id, ignoreOnNotFound);
  }

  public async add(payload: T) {
    const newRecord = await Record.add(this._modelConstructor, payload);
    this._data.push(newRecord.data);
    return newRecord;
  }

  /**
   * Gets the data from a given record; return _undefined_ if not found
   */
  public get(id: string): T {
    return this.data.find((i) => i.id === id);
  }

  /** Deprecated: use `List.get()` instead */
  public getData(id: string): T {
    console.log("List.getData() is deprecated; use List.get()");
    return this.get(id);
  }

  /**
   * Loads data from a query into the `List` object
   */
  protected async _loadQuery(query: ISerializedQuery<T>) {
    if (!this.db) {
      const e = new Error(
        `The attempt to load data into a List requires that the DB property be initialized first!`
      );
      e.name = "NoDatabase";
      throw e;
    }

    this._query = query;
    this._data = await this.db.getList<T>(query);
    return this;
  }

  //#endregion Public API

  private _injectDynamicDbOffsets(dbOffset: string) {
    if (dbOffset.indexOf(":") === -1) {
      return dbOffset;
    }

    const dynamicPathProps = Record.dynamicPathProperties(
      this._modelConstructor
    );

    Object.keys(this._offsets || {}).forEach((prop: keyof T & string) => {
      if (dynamicPathProps.includes(prop)) {
        const value = this._offsets[prop as keyof T];
        if (!["string", "number"].includes(typeof value)) {
          throw new FireModelError(
            `The dynamic dbOffset is using the property "${prop}" on ${
              this.modelName
            } as a part of the route path but that property must be either a string or a number and instead was a ${typeof value}`,
            "record/not-allowed"
          );
        }
        dbOffset = dbOffset.replace(`:${prop}`, String(value));
      }
    });

    if (dbOffset.includes(":")) {
      throw new FireModelError(
        `Attempt to get the dbPath of a List where the underlying model [ ${capitalize(
          this.modelName
        )} ] has dynamic path segments which were NOT supplied! The offsets provided were "${JSON.stringify(
          Object.keys(this._offsets || {})
        )}" but this leaves the following uncompleted dbOffset: ${dbOffset}`
      );
    }

    return dbOffset;
  }
}

export type ListFilterFunction<T> = (fc: T) => boolean;
export type ListMapFunction<T, K = any> = (fc: T) => K;
export type ListReduceFunction<T, K = any> = (
  accumulator: Partial<K>,
  record: T
) => K;
