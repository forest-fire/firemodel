import { BaseSchema } from './base-schema';
import DB from 'abstracted-admin';

export class Record<T extends BaseSchema> {

  private _existsOnDB: boolean = false;
  private _isDirty: boolean = false;

  constructor(
    private _schemaClass: new () => T,
    private _db: DB,
    public data?: T
  ) {
    this.data = new this._schemaClass();
    if (data) {
      this.initialize(data);
    }
  }

  public get dbPath() {
    return [
      this.data.META.dbOffset,
      this.data.id
    ].join('.');
  }

  public initialize(data: Partial<T>) {
    Object.keys(data).map((key: keyof T) => this.data[key] = data[key]);
  }

  public get existsOnDB() {
    return this._existsOnDB;
  }

  public async load(id: string) {
    console.log('loading', this.data.META);

    const data = await this._db.getRecord<T>(this.dbPath);
    if (data) {
      this._existsOnDB = true;
      this.initialize(data);
    } else {
      this._existsOnDB = false;
      throw new Error(`Unknown Key: the key "${id}" was not found in Firebase at "${this.dbPath}".`);
    }

    return this;
  }
}
