// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { SerializedQuery, IComparisonOperator } from "serialized-query";
import Model, { IModelOptions } from "./model";

export class List<T extends BaseSchema> {
  public static create<T extends BaseSchema>(schema: new () => T, options: IModelOptions = {}) {
    const model = Model.create(schema, options);
    return new List<T>(model);
  }

  /**
   * Creates a List<T> which is populated with the passed in query
   *
   * @param schema the schema type
   * @param query the serialized query; note that this LIST will override the path of the query
   * @param options model options
   */
  public static async from<T extends BaseSchema>(
    schema: new () => T,
    query: SerializedQuery,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const model = Model.create(schema, options);
    query.setPath(model.dbPath);
    const list = List.create(schema, options);

    await list.load(query);
    return list;
  }

  public static async first<T extends BaseSchema>(
    schema: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
    const list = await List.from(schema, query, options);

    return list;
  }

  public static async recent<T extends BaseSchema>(
    schema: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
    const list = await List.from(schema, query, options);

    return list;
  }

  public static async inactive<T extends BaseSchema>(
    schema: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
    const list = await List.from(schema, query, options);

    return list;
  }

  public static async last<T extends BaseSchema>(
    schema: new () => T,
    howMany: number,
    options: IModelOptions = {}
  ): Promise<List<T>> {
    const query = new SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
    const list = await List.from(schema, query, options);

    return list;
  }

  public static async where<T extends BaseSchema, K extends keyof T>(
    schema: new () => T,
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
    const list = await List.from(schema, query, options);

    return list;
  }

  constructor(private _model: Model<T>, private _data: T[] = []) {}

  public get length(): number {
    return this._data.length;
  }

  protected get db() {
    return this._model.db;
  }

  public get modelName() {
    return this._model.modelName;
  }

  public get pluralName() {
    return this._model.pluralName;
  }

  public get dbPath() {
    return [this.meta.dbOffset, this.pluralName].join("/");
  }

  public get localPath() {
    return [this.meta.localOffset, this.pluralName].join("/");
  }

  public get meta(): ISchemaOptions {
    return this._model.schema.META;
  }

  /** Returns another List with data filtered down by passed in filter function */
  public filter(f: ListFilterFunction<T>) {
    return new List(this._model, this._data.filter(f));
  }

  /** Maps the data in the list to a plain JS object. Note: maintaining a List container isn't practical as the transformed data structure might not be a defined schema type */
  public map<K = any>(f: ListMapFunction<T, K>) {
    return this._data.map(f);
  }

  public get data() {
    return this._data;
  }

  public async load(pathOrQuery: string | SerializedQuery<T>) {
    this._data = await this.db.getList<T>(pathOrQuery);
    return this;
  }
}

export type ListFilterFunction<T> = (fc: T) => boolean;
export type ListMapFunction<T, K = any> = (fc: T) => K;
