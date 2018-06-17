// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Model, IModelMetaProperties } from ".";
import { createError, fk, IDictionary } from "common-types";
import { key as fbKey } from "firebase-key";
import { FireModel, IMultiPathUpdates } from "./FireModel";
import { IReduxDispatch } from "./VuexWrapper";
import { FMEvents, IFMEventName } from "./state-mgmt/index";

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
  logging?: any;
  id?: string;
  /** if you're working off of a mocking database, there are situations where adding a record silently (aka., not triggering any listener events) is desirable and should be allowed */
  silent?: boolean;
}

export class Record<T extends Model> extends FireModel<T> {
  //#region STATIC INTERFACE
  public static set defaultDb(db: RealTimeDB) {
    FireModel.defaultDb = db;
  }
  public static get defaultDb() {
    return FireModel.defaultDb;
  }

  public static set dispatch(fn: IReduxDispatch) {
    FireModel.dispatch = fn;
  }
  /**
   * create
   *
   * creates a new -- and empty -- Record object; often used in
   * conjunction with the Record's initialize() method
   */
  public static create<T extends Model>(
    model: new () => T,
    options: IRecordOptions = {}
  ) {
    const r = new Record<T>(model, options);
    if (options.silent && !r.db.isMockDb) {
      const e = new Error(
        `You can only add new records to the DB silently when using a Mock database!`
      );
      e.name = "FireModel::Forbidden";
      throw e;
    }

    return r;
  }

  /**
   * add
   *
   * Adds a new record to the database
   *
   * @param schema the schema of the record
   * @param payload the data for the new record
   * @param options
   */
  public static async add<T extends Model>(
    model: new () => T,
    payload: T,
    options: IRecordOptions = {}
  ) {
    let r;
    try {
      r = Record.create(model, options);
      r._initialize(payload);
      await r._save();
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${e.message}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }

    return r;
  }

  /**
   * load
   *
   * static method to create a Record when you want to load the
   * state of the record with something you already have.
   *
   * Intent should be that this record already exists in the
   * database. If you want to add to the database then use add()
   */
  public static createWith<T extends Model>(
    model: new () => T,
    payload: T,
    options: IRecordOptions = {}
  ) {
    const rec = Record.create(model, options);
    rec._initialize(payload);

    return rec;
  }

  public static async get<T extends Model>(
    model: new () => T,
    id: string,
    options: IRecordOptions = {}
  ) {
    const record = Record.create(model, options);
    await record._getFromDB(id);
    return record;
  }

  public static async remove<T extends Model>(
    model: new () => T,
    id: string,
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState?: Record<T>
  ) {
    // TODO: add lookup in local state to see if we can avoid DB call
    const record = currentState ? currentState : await Record.get(model, id);
    await record.remove();
    return record;
  }

  //#endregion

  //#region OBJECT DEFINITION
  private _existsOnDB: boolean = false;
  private _writeOperations: IWriteOperation[] = [];
  private _data?: Partial<T>;

  constructor(model: new () => T, options: IRecordOptions = {}) {
    super();
    this._modelConstructor = model;
    this._model = new model();
    this._data = new model();
  }

  public get data() {
    return this._data as Readonly<T>;
  }

  public get isDirty() {
    return this.META.isDirty ? true : false;
  }

  /**
   * set the dirty flag of the model
   */
  public set isDirty(value: boolean) {
    this._data.META = { isDirty: value };
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
    return [this.data.META.localOffset, this.pluralName, this.data.id].join(
      "/"
    );
  }

  /**
   * Allows an empty Record to be initialized to a known state.
   * This is not intended to allow for mass property manipulation other
   * than at time of initialization
   *
   * @param data the initial state you want to start with
   */
  public _initialize(data: T) {
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
  }

  public get existsOnDB() {
    return this.data && this.data.id ? true : false;
  }

  /**
   * Pushes new values onto properties on the record
   * which have been stated to be a "pushKey"
   */
  public async pushKey<K extends keyof T>(
    property: K,
    value: T[K][keyof T[K]]
  ) {
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
    const key = fbKey();
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
   * include the "lastUpdated" property. Does NOT allow relationships to be included,
   * this should be done separately.
   *
   * @param props a hash of name value pairs which represent the props being updated and their new values
   */
  public async update(props: Partial<T>) {
    // can not update relationship properties
    if (
      Object.keys(props).some((key: any) => {
        const root = key.split(".")[0];
        return this.META.property(root).isRelationship;
      })
    ) {
      const relProps = Object.keys(props).filter(
        (p: any) => this.META.property(p).isRelationship
      );
      const e = new Error(
        `You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(
          ", "
        )}.`
      );
      e.name = "FireModel::NotAllowed";
      throw e;
    }

    const lastUpdated = new Date().getTime();
    const changed: any = {
      ...(props as IDictionary),
      lastUpdated
    };
    await this._updateProps(
      FMEvents.RECORD_CHANGED_LOCALLY,
      FMEvents.RECORD_CHANGED,
      changed
    );
    if (this.META.audit) {
      // TODO: implement for auditing
    }

    return;
  }

  /**
   * remove
   *
   * Removes the active record from the database and dispatches the change to
   * FE State Mgmt.
   */
  public async remove() {
    this.isDirty = true;
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RECORD_REMOVED_LOCALLY, [
        { path: this.dbPath, value: null }
      ])
    );
    await this.db.remove(this.dbPath);
    if (this.META.audit) {
      // TODO: implement for auditing
    }
    this.isDirty = false;
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RECORD_REMOVED, this.data)
    );
  }

  /**
   * Changes the local state of a property on the record
   *
   * @param prop the property on the record to be changed
   * @param value the new value to set to
   */
  public async set<K extends keyof T>(prop: K, value: T[K]) {
    if (this.META.property(prop).isRelationship) {
      const e = new Error(
        `You can not "set" the property "${prop}" because it is configured as a relationship!`
      );
      e.name = "FireModel::NotAllowed";
      throw e;
    }
    const lastUpdated = new Date().getTime();
    const changed: any = {
      [prop]: value,
      lastUpdated
    };
    await this._updateProps(
      FMEvents.RECORD_CHANGED_LOCALLY,
      FMEvents.RECORD_CHANGED,
      changed
    );
    if (this.META.audit) {
      // TODO: implement for auditing
    }

    return;
  }

  /**
   * Adds another fk to a hasMany relationship
   *
   * @param property the property which is acting as a foreign key (array)
   * @param ref reference to ID of related entity
   * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
   */
  public async addHasMany(
    property: Extract<keyof T, string>,
    ref: Extract<fk, string>,
    optionalValue: any = true
  ) {
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
      (this.data[property] as any)[ref]
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

  /** indicates whether this record is already being watched locally */
  public get isBeingWatched() {
    return FireModel.isBeingWatched(this.dbPath);
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

  protected async _updateProps<K extends IFMEventName<K>>(
    actionTypeStart: K,
    actionTypeEnd: K,
    changed: Partial<T>
  ) {
    this.isDirty = true;
    Object.keys(changed).map((prop: Extract<string, keyof T>) => {
      this._data[prop] = changed[prop];
    });
    const paths = this._getPaths(changed);

    this.dispatch(this._createRecordEvent(this, actionTypeStart, paths));

    const mps = this.db.multiPathSet(this.dbPath);
    paths.map(path => mps.add(path));
    await mps.execute();
    this.isDirty = false;
    this._data.lastUpdated = new Date().getTime();

    // if this path is being watched we should avoid
    // sending a duplicative event
    if (!this.isBeingWatched) {
      this.dispatch(this._createRecordEvent(this, actionTypeEnd, this.data));
    }
  }

  /**
   * Load data from a record in database
   */
  private async _getFromDB(id: string) {
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
      this._initialize(data);
    } else {
      throw new Error(
        `Unknown Key: the key "${id}" was not found in Firebase at "${
          this.dbPath
        }".`
      );
    }

    return this;
  }

  private async _save() {
    if (!this.id) {
      this.id = fbKey();
    }
    const now = new Date().getTime();
    if (!this.get("createdAt")) {
      this._data.createdAt = now;
    }
    this._data.lastUpdated = now;
    if (!this.db) {
      const e = new Error(
        `Attempt to save Record failed as the Database has not been connected yet. Try settingFireModel first.`
      );
      e.name = "FiremodelError";
      throw e;
    }
    const paths: IMultiPathUpdates[] = [{ path: "/", value: this._data }];
    this.isDirty = true;
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RECORD_ADDED_LOCALLY, paths)
    );
    const mps = this.db.multiPathSet(this.dbPath);
    paths.map(path => mps.add(path));
    await mps.execute();
    this.isDirty = false;

    if (!FireModel.isBeingWatched(this.dbPath)) {
      // TODO: is there any reason we'd need to load from server like with update?
      this.dispatch(
        this._createRecordEvent(this, FMEvents.RECORD_ADDED, this.data)
      );
    }

    return this;
  }

  //#endregion
}
