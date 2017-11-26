import { BaseSchema, ISchemaOptions } from './index';
import DB from 'abstracted-admin';
import { SerializedQuery } from 'serialized-query';

export class List<T extends BaseSchema> {
  private _schema: T;

  constructor(
    private _schemaClass: new () => T,
    private _pluralName: string,
    private _db: DB,
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
    return [
      this._schema.META.dbOffset,
      this.pluralName
    ].join('/');
  }

  public get meta(): ISchemaOptions {
    return this._schema.META;
  }

  public get data() {
    return this._data;
  }

  public async load(path: string | SerializedQuery) {
    this._data = await this._db.getList<T>(path);
    return this;
  }
}
