import { Model, ISchemaOptions, Record } from ".";
import { SerializedQuery, IComparisonOperator } from "serialized-query";
import { OldModel, IModelOptions } from "./old-model";
import { epochWithMilliseconds } from "common-types";
import { FireModel } from "./FireModel";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";

const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";

export class List<T extends Model> extends FireModel<T> {
  public static set defaultDb(db: RealTimeDB) {
    FireModel.defaultDb = db;
  }
  public static get defaultDb() {
    return FireModel.defaultDb;
  }

  public static create<T extends Model>(model: new () => T, options: IModelOptions = {}) {
    return new List<T>(model);
  }

  /**
   * Creates a List<T> which is populated with the passed in query
   *
   * @param schema the schema type
   * @param query the serialized query; note that this LIST will override the path of the query
   * @param options model options
   */
  public static async fromQuery<T extends Model>(
    schema: new () => T,
    query: SerializedQuery,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const model = OldModel.create(schema, options);
    query.setPath(model.dbPath);
    const list = List.create(schema, options);

    await list.load(query);
    return list;
  }

  /**
   * Loads all the records of a given schema-type ordered by lastUpdated
   *
   * @param schema the schema type
   * @param options model options
   */
  public static async all<T extends Model>(
    model: new () => T,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("lastUpdated");
    const list = await List.fromQuery<T>(model, query, options);

    return list;
  }

  /**
   * Loads the first X records of the Schema type where
   * ordering is provided by the "createdAt" property
   *
   * @param model the model type
   * @param howMany the number of records to bring back
   * @param options model options
   */
  public static async first<T extends Model>(
    model: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  /**
   * recent
   *
   * Get recent items of a given type/schema (based on lastUpdated)
   *
   * @param model the TYPE you are interested
   * @param howMany the quantity to of records to bring back
   * @param offset start at an offset position (useful for paging)
   * @param options
   */
  public static async recent<T extends Model>(
    model: new () => T,
    howMany: number,
    offset: number = 0,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  /**
   * since
   *
   * Bring back all records that have changed since a given date
   *
   * @param schema the TYPE you are interested
   * @param since  the datetime in miliseconds
   * @param options
   */
  public static async since<T extends Model>(
    model: new () => T,
    since: epochWithMilliseconds,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    if (typeof since !== "number") {
      const e = new Error(
        `Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`
      );
      e.name = "NotAllowed";
      throw e;
    }

    // const query = new SerializedQuery().orderByChild("lastUpdated").startAt(since);
    const query = new SerializedQuery<T>().orderByChild("lastUpdated").startAt(since);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  public static async inactive<T extends Model>(
    model: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  public static async last<T extends Model>(
    model: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  public static async where<T extends Model, K extends keyof T>(
    model: new () => T,
    property: K,
    value: T[K] | [IComparisonOperator, T[K]],
    options: IModelOptions = {}
  ) {
    let operation: IComparisonOperator = "=";
    let val = value;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    }
    const query = new SerializedQuery().orderByChild(property).where(operation, val);
    const list = await List.fromQuery(model, query, options);

    return list;
  }

  constructor(model: new () => T, private _data: T[] = []) {
    super();
    this._modelConstructor = model;
    this._model = new model();
  }

  public get length(): number {
    return this._data.length;
  }

  public get dbPath() {
    return [this.META.dbOffset, this.pluralName].join("/");
  }

  public get localPath() {
    return [this.META.localOffset, this.pluralName].join("/");
  }

  public get meta(): ISchemaOptions {
    return this._model.META;
  }

  /** Returns another List with data filtered down by passed in filter function */
  public filter(f: ListFilterFunction<T>) {
    const list = List.create(this._modelConstructor);
    list._data = this._data.filter(f);
    return list;
  }

  /** Returns another List with data filtered down by passed in filter function */
  public find(
    f: ListFilterFunction<T>,
    defaultIfNotFound = DEFAULT_IF_NOT_FOUND
  ): Record<T> {
    const filtered = this._data.filter(f);
    const r = Record.create(this._modelConstructor);
    if (filtered.length > 0) {
      r._initialize(filtered[0]);
      return r;
    } else {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound as any;
      } else {
        const e = new Error(
          `find(fn) did not find a value in the List [ length: ${this.data.length} ]`
        );
        e.name = "NotFound";
        throw e;
      }
    }
  }

  public filterWhere<K extends keyof T>(prop: K, value: T[K]): List<T> {
    const whereFilter = (item: T) => item[prop] === value;
    return new List(this._modelConstructor, this._data.filter(whereFilter));
  }

  /**
   * findWhere
   *
   * returns the first record in the list where the property equals the
   * specified value. If no value is found then an error is thrown unless
   * it is stated
   */
  public findWhere(
    prop: keyof T,
    value: T[typeof prop],
    defaultIfNotFound = DEFAULT_IF_NOT_FOUND
  ): Record<T> {
    const list = this.filterWhere(prop, value);

    if (list.length > 0) {
      return Record.load(this._modelConstructor, list._data[0]);
    } else {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound as any;
      } else {
        const e = new Error(
          `findWhere(${prop}, ${value}) was not found in the List [ length: ${
            this.data.length
          } ]`
        );
        e.name = "NotFound";
        throw e;
      }
    }
  }

  /**
   * provides a map over the data structured managed by the List; there will be no mutations to the
   * data managed by the list
   */
  public map<K = any>(f: ListMapFunction<T, K>) {
    return this.data.map(f);
  }

  public get data() {
    return this._data;
  }

  /**
   * Returns the specified record Record object
   *
   * @param id the unique ID which is being looked for
   * @param defaultIfNotFound the default value returned if the ID is not found in the list
   */
  public get(id: string, defaultIfNotFound: any = DEFAULT_IF_NOT_FOUND): Record<T> {
    const find = this.filter(f => f.id === id);
    if (find.length === 0) {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound;
      }
      const e = new Error(`Could not find "${id}" in list of ${this.pluralName}`);
      e.name = "NotFound";
      throw e;
    }

    const r = Record.create(this._modelConstructor);
    r._initialize(find.data[0]);
    return r;
  }

  /**
   * Returns the single instance of an object contained by the List container
   *
   * @param id the unique ID which is being looked for
   * @param defaultIfNotFound the default value returned if the ID is not found in the list
   */
  public getData(id: string, defaultIfNotFound: any = "__DO_NOT_USE__"): T {
    const record = this.get(id, defaultIfNotFound);

    return record === defaultIfNotFound ? defaultIfNotFound : ((record as any).data as T);
  }

  public async load(pathOrQuery: string | SerializedQuery<T>) {
    if (!this.db) {
      const e = new Error(
        `The attempt to load data into a List requires that the DB property be initialized first!`
      );
      e.name = "NoDatabase";
      throw e;
    }
    this._data = await this.db.getList<T>(pathOrQuery);
    return this;
  }
}

export type ListFilterFunction<T> = (fc: T) => boolean;
export type ListMapFunction<T, K = any> = (fc: T) => K;
