// tslint:disable-next-line:no-implicit-dependencies
import pushKey, { RealTimeDB } from "abstracted-firebase";
import { BaseSchema, ISchemaOptions } from "./index";
import { createError, fk, IDictionary } from "common-types";
import Model, { ILogger } from "./model";
import { key as fbk } from "firebase-key";

export interface IMultiPropUpdate<T extends string> {
  [key: keyof T]: any;
}

export interface IWriteOperation {
  id: string;
  type: "set" | "pushKey" | "update";
  /** The database path being written to */
  path: string;
  /** The new value being written to database */
  value: any;
  /** called on positive confirmation received from server */
  callback: (type: string, value: any) => void;
}

export interface IRecordOptions {
  db?: RealTimeDB;
  logging?: ILogger;
  id?: string;
}

export class Record<T extends BaseSchema> {
  public static create<T extends BaseSchema>(
    schema: new () => T,
    options: IRecordOptions = {}
  ) {
    const model = Model.create(schema, options);
    const record = new Record<T>(model, options);

    return record;
  }

  public static async add<T extends BaseSchema>(
    schema: new () => T,
    newRecord: T,
    options: IRecordOptions = {}
  ) {
    // const r = new Record(schema, options);
    const r = Record.create(schema, options);

    await r.initialize(newRecord);

    return r;
  }

  public static async get<T extends BaseSchema>(
    schema: new () => T,
    id: string,
    options: IRecordOptions = {}
  ) {
    const record = Record.create(schema, options);
    await record.load(id);
    return record;
  }

  private _existsOnDB: boolean = false;
  private _writeOperations: IWriteOperation[] = [];
  private _data?: Partial<T>;

  constructor(private _model: Model<T>, options: IRecordOptions = {}) {
    this._data = new _model.schemaClass();
  }

  public get data() {
    return this._data as Readonly<T>;
  }

  public get isDirty() {
    return this._writeOperations.length > 0 ? true : false;
  }

  public get META(): ISchemaOptions {
    return this._model.schema.META;
  }

  protected get db() {
    return this._model.db;
  }

  protected get pluralName() {
    return this._model.pluralName;
  }

  protected get pushKeys() {
    return this._model.schema.META.pushKeys;
  }

  /**
   * returns the fully qualified name in the database to this record;
   * this of course includes the record id so if that's not set yet calling
   * this getter will result in an error
   */
  public get dbPath() {
    if (!this.data.id) {
      throw createError(
        "record/invalid-path",
        `Invalid Record Path: you can not ask for the dbPath before setting an "id" property.`
      );
    }
    return [this.data.META.dbOffset, this.pluralName, this.data.id].join("/");
  }

  public get modelName() {
    return this.data.constructor.name.toLowerCase();
  }

  /** The Record's primary key */
  public get id() {
    return this.data.id;
  }

  public set id(val: string) {
    if (this.data.id) {
      const e = new Error(
        `You may not re-set the ID of a record [ ${this.data.id} → ${val} ].`
      );
      e.name = "NotAllowed";
      throw e;
    }

    this._data.id = val;
  }

  /**
   * returns the record's database offset without including the ID of the record;
   * among other things this can be useful prior to establishing an ID for a record
   */
  public get dbOffset() {
    return this.data.META.dbOffset;
  }

  /**
   * returns the record's location in the frontend state management framework;
   * depends on appropriate configuration of model to be accurate.
   */
  public get localPath() {
    if (!this.data.id) {
      throw new Error(
        'Invalid Path: you can not ask for the dbPath before setting an "id" property.'
      );
    }
    return [this.data.META.localOffset, this.pluralName, this.data.id].join("/");
  }

  /**
   * Allows an empty Record to be initialized to a known state.
   * This is not intended to allow for mass property manipulation other
   * than at time of initialization
   *
   * @param data the initial state you want to start with
   */
  public async initialize(data: T) {
    Object.keys(data).map(key => {
      this._data[key as keyof T] = data[key as keyof T];
    });
    const relationships = this.META.relationships;

    const ownedByRels = (relationships || [])
      .filter(r => r.relType === "ownedBy")
      .map(r => r.property);
    const hasManyRels = (relationships || [])
      .filter(r => r.relType === "hasMany")
      .map(r => r.property);

    // default hasMany to empty hash
    hasManyRels.map((p: string) => {
      if (!this._data[p as keyof T]) {
        (this._data as any)[p] = {};
      }
    });

    const now = new Date().getTime();
    if (!this._data.lastUpdated) {
      this._data.lastUpdated = now;
    }
    if (!this._data.createdAt) {
      this._data.createdAt = now;
    }
    if (!this.id) {
      this._save();
    }
  }

  public get existsOnDB() {
    return this.data && this.data.id ? true : false;
  }

  /**
   * Load data from a record in database
   */
  public async load(id: string) {
    if (!this.db) {
      const e = new Error(
        `The attempt to load data into a Record requires that the DB property be initialized first!`
      );
      e.name = "NoDatabase";
      throw e;
    }

    this._data.id = id;
    const data = await this.db.getRecord<T>(this.dbPath);

    if (data && data.id) {
      this.initialize(data);
    } else {
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

    return this.db.update<T>(this.dbPath, hash);
  }

  /**
   * Pushes new values onto properties on the record
   * which have been stated to be a "pushKey"
   */
  public async pushKey<K extends keyof T>(property: K, value: T[K][keyof T[K]]) {
    if (this.META.pushKeys.indexOf(property as any) === -1) {
      throw createError(
        "invalid-operation/not-pushkey",
        `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`
      );
    }

    if (!this.existsOnDB) {
      throw createError(
        "invalid-operation/not-on-db",
        `Invalid Operation: you can not push to property "${property}" before saving the record to the database`
      );
    }
    const key = fbk();
    const currentState = this.get(property) || {};
    const newState = { ...(currentState as any), [key]: value };
    // set state locally
    this.set(property, newState);
    // push updates to db
    const write = this.db.multiPathSet(`${this.dbPath}/`);
    write.add({ path: `lastUpdated`, value: new Date().getTime() });
    write.add({ path: `${property}/${key}`, value });
    try {
      await write.execute();
    } catch (e) {
      throw createError("multi-path/write-error", "", e);
    }

    return key;
  }

  /**
   * Updates a set of properties on a given model atomically (aka, all at once); will automatically
   * include the "lastUpdated" property.
   *
   * @param props a hash of name value pairs which represent the props being updated and their new values
   */
  public async updateProps(props: Partial<T>) {
    const updater = this.db.multiPathSet(this.dbPath);
    Object.keys(props).map((key: keyof T) => {
      if (typeof props[key] === "object") {
        const existingState = this.get(key);
        props[key] = { ...(existingState as any), ...(props[key] as any) };
      }
      updater.add({ path: key, value: props[key] });
      this.set(key, props[key]);
    });
    const now = new Date().getTime();
    updater.add({ path: "lastUpdated", value: now });
    this.set("lastUpdated", now);
    try {
      await updater.execute();
    } catch (e) {
      throw createError(
        "UpdateProps",
        `An error occurred trying to update ${this._model.modelName}:${this.id}`,
        e
      );
    }
  }

  /**
   * Adds another fk to a hasMany relationship
   *
   * @param property the property which is acting as a foreign key (array)
   * @param ref reference to ID of related entity
   * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
   */
  public async addHasMany(property: keyof T, ref: fk, optionalValue: any = true) {
    if (this.META.property(property).relType !== "hasMany") {
      const e = new Error(
        `The property "${property}" does NOT have a "hasMany" relationship on ${
          this.modelName
        }`
      );
      e.name = "InvalidRelationship";
      throw e;
    }
    if (
      typeof this.data[property] === "object" &&
      (this.data[property] as IDictionary)[ref]
    ) {
      console.warn(
        `The fk of "${ref}" already exists in "${this.modelName}.${property}"!`
      );
      return;
    }

    await this.db
      .multiPathSet(this.dbPath)
      .add({ path: `${property}/${ref}/`, value: optionalValue })
      .add({ path: "lastUpdated", value: new Date().getTime() })
      .execute();
  }

  /**
   * Changes the local state of a property on the record
   *
   * @param prop the property on the record to be changed
   * @param value the new value to set to
   */
  public async set<K extends keyof T>(prop: K, value: T[K]) {
    // TODO: add interaction points for client-side state management; goal
    // is to have local state changed immediately but with meta data to indicate
    // that we're waiting for backend confirmation.
    this._data[prop] = value;

    await this.db
      .multiPathSet(this.dbPath)
      .add({ path: `${prop}/`, value })
      .add({ path: "lastUpdated", value: new Date().getTime() })
      .execute();

    return;
  }

  /**
   * get a property value from the record
   *
   * @param prop the property being retrieved
   */
  public get<K extends keyof T>(prop: K) {
    return this.data[prop];
  }

  public toString() {
    return `Record::${this.modelName}@${this.id || "undefined"}`;
  }

  public toJSON() {
    return {
      dbPath: this.dbPath,
      modelName: this.modelName,
      pluralName: this.pluralName,
      key: this.id,
      localPath: this.localPath,
      data: this.data.toString()
    };
  }

  private async _save() {
    if (this.id) {
      const e = new Error(`Saving after ID is set is not allowed [ ${this.id} ]`);
      e.name = "InvalidSave";
      throw e;
    }
    this.id = fbk();

    await this.db.set<T>(this.dbPath, this.data);

    return this;
  }
}
