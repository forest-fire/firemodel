// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { SerializedQuery } from "serialized-query";

export class List<T extends BaseSchema> {
  private _schema: T;

  constructor(
    private _schemaClass: new () => T,
    private _pluralName: string,
    private _db: RealTimeDB,
    private _data: T[] = []
  ) {
    this._schema = new this._schemaClass();
    // if (_data) {
    //   this.initialize(_data);
    // }
  }

  public get length(): number {
    return this._data.length;
  }

  public get modelName() {
    return this._schema.constructor.name.toLowerCase();
  }

  public get pluralName() {
    return this._pluralName;
  }

  public get dbPath() {
    return [this._schema.META.dbOffset, this.pluralName].join("/");
  }

  public get meta(): ISchemaOptions {
    return this._schema.META;
  }

  /** Returns another List with data filtered down by passed in filter function */
  public filter(f: ListFilterFunction<T>) {
    return new List(this._schemaClass, this._pluralName, this._db, this._data.filter(f));
  }

  /** Maps the data in the list to a plain JS object. Note: maintaining a List container isn't practical as the transformed data structure might not be a defined schema type */
  public map<K = any>(f: ListMapFunction<T, K>) {
    return this._data.map(f);
  }

  public get data() {
    return this._data;
  }

  public async load(path: string | SerializedQuery) {
    this._data = await this._db.getList<T>(path);
    return this;
  }
}

export type ListFilterFunction<T> = (fc: T) => boolean;
export type ListMapFunction<T, K = any> = (fc: T) => K;
