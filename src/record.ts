// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";

export class Record<T extends BaseSchema> {
  private _existsOnDB: boolean = false;
  private _isDirty: boolean = false;

  constructor(
    private _schemaClass: new () => T,
    private _pluralName: string,
    private _db: RealTimeDB,
    private _data?: T
  ) {
    this._data = new this._schemaClass();
    if (_data) {
      this.initialize(_data);
    }
  }

  public get data() {
    return this._data;
  }

  public get meta(): ISchemaOptions {
    return this.data.META;
  }

  public get dbPath() {
    if (!this.data.id) {
      throw new Error(
        'Invalid Path: you can not ask for the dbPath before setting an "id" property.'
      );
    }
    return [this.data.META.dbOffset, this.pluralName, this.data.id].join("/");
  }

  public get modelName() {
    return this.data.constructor.name.toLowerCase();
  }
  public get pluralName() {
    return this._pluralName;
  }

  public get key() {
    if (!this.data.id) {
      throw new Error("key is not set yet!");
    }
    return this.data.id;
  }

  public get localPath() {
    if (!this.data.id) {
      throw new Error(
        'Invalid Path: you can not ask for the dbPath before setting an "id" property.'
      );
    }
    return [this.data.META.localOffset, this.pluralName, this.data.id].join(
      "/"
    );
  }

  public initialize(data: Partial<T>) {
    Object.keys(data).forEach((key: keyof T) => (this.data[key] = data[key]));
  }

  public get existsOnDB() {
    return this._existsOnDB;
  }

  public async load(id: string) {
    this.data.id = id;
    const data = await this._db.getRecord<T>(this.dbPath);
    if (data && data.id) {
      this._existsOnDB = true;
      this.initialize(data);
    } else {
      this._existsOnDB = false;
      throw new Error(
        `Unknown Key: the key "${id}" was not found in Firebase at "${
          this.dbPath
        }".`
      );
    }

    return this;
  }

  public async update(hash: Partial<T>) {
    if (!this.data.id || !this._existsOnDB) {
      throw new Error(
        `Invalid Operation: you can not update a record which doesn't have an "id" or which has never been saved to the database`
      );
    }

    return this._db.update<T>(this.dbPath, hash);
  }

  public async set(hash: T) {
    if (!this.data.id) {
      throw new Error(
        `Invalid Operation: you can not SET a record which doesn't have an "id"`
      );
    }

    return this._db.set<T>(this.dbPath, hash);
  }
}
