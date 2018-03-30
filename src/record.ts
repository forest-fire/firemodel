// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { slashNotation, createError } from "./util";
import { VerboseError } from "./VerboseError";

export class Record<T extends BaseSchema> {
  private _existsOnDB: boolean = false;
  private _isDirty: boolean = false;
  private _data?: Partial<T>;

  constructor(
    private _schemaClass: new () => T,
    private _pluralName: string,
    private _db: RealTimeDB,
    private _pushKeys: string[],
    initializeRecord?: Partial<T>
  ) {
    this._data = new this._schemaClass();

    if (initializeRecord) {
      this.initialize(initializeRecord);
    }
  }

  public get data() {
    return this._data;
  }

  public get META(): ISchemaOptions {
    return this.data.META;
  }

  public toJSON() {
    return this.toString();
  }
  public toString() {
    return JSON.stringify({
      dbPath: this.dbPath,
      modelName: this.modelName,
      pluralName: this.pluralName,
      key: this.key,
      localPath: this.localPath,
      data: this.data
    });
  }

  public get dbPath() {
    if (!this.data.id) {
      throw new Error(
        `Invalid Path: you can not ask for the dbPath before setting an "id" property. [${this._schemaClass.toString()}]`
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
    return [this.data.META.localOffset, this.pluralName, this.data.id].join("/");
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
        `Unknown Key: the key "${id}" was not found in Firebase at "${this.dbPath}".`
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

  /**
   * Pushes new values onto properties on the record which have been stated to be a "pushKey".
   * This record must already exist in the DB before utilizing and the result is immediately
   * pushed to the database rather than waiting for an "update" call which updates the entire
   * record structure.
   *
   * Note that calling this function also updates the "lastUpdated" property on the Record
   */
  public async pushKey<PK = any>(property: string, value: PK) {
    if (this.META.pushKeys.indexOf(property) === -1) {
      throw new Error(
        `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`
      );
    }

    if (!this.existsOnDB) {
      throw new Error(
        `Invalid Operation: you can not push to property "${property}" before saving the record to the database`
      );
    }

    let pushKey;
    try {
      pushKey = this._db.push<PK>(slashNotation(this.dbPath, property), value);
    } catch (e) {
      throw createError(
        e,
        "failed-pushkey",
        `There was a problem pushing a ${typeof value} onto the path "${this.dbPath}/${property}"`
      );
    }
    try {
      await this._db.set<string>(
        `${slashNotation(this.dbPath)}/lastUpdated`,
        new Date().toISOString()
      );
    } catch (e) {
      console.warn(
        `Pushkey was successfully pushed but couldn't update the record's [ ${
          this.key
        } ] lastUpdate field`
      );
    }

    return pushKey;
  }

  public async set(hash: T) {
    if (!this.data.id) {
      throw new Error(`Invalid Operation: you can not SET a record which doesn't have an "id"`);
    }

    return this._db.set<T>(this.dbPath, hash);
  }
}
