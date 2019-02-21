// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Model, IModelOptions } from "./Model";
import { createError, fk, IDictionary, Omit } from "common-types";
import { key as fbKey } from "firebase-key";
import { FireModel, IMultiPathUpdates } from "./FireModel";
import { IReduxDispatch } from "./VuexWrapper";
import { FMEvents, IFMEventName } from "./state-mgmt/index";
import { pathJoin } from "./path";
import { getModelMeta, addModelMeta, modelsWithMeta } from "./ModelMeta";
import { writeAudit, IAuditChange, IAuditOperations } from "./Audit";
import { updateToAuditChanges } from "./util";
import {
  IIdWithDynamicPrefix,
  IFkReference,
  ICompositeKey
} from "./@types/record-types";

function createCompositeKey<T extends Record<T>>(rec: T) {
  const model = rec.data;
  return {
    ...{ id: rec.id },
    ...rec.dynamicPathComponents.reduce(
      (prev, key) => ({
        ...prev,
        [key]: model.get(key as keyof T)
      }),
      {}
    )
  };
}

function createCompositeKeyString<T extends Record<T>>(rec: T) {
  const cKey: IDictionary = createCompositeKey<T>(rec);
  return (
    cKey.id +
    Object.keys(cKey)
      .filter(k => k !== "id")
      .map(k => `::${k}:${cKey[k]}`)
  );
}

// TODO: see if there's a way to convert to interface so that design time errors are more clear
export type ModelOptionalId<T extends Model> = Omit<T, "id"> & { id?: string };

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

  public get data() {
    return this._data as Readonly<T>;
  }

  public get isDirty() {
    return this.META.isDirty ? true : false;
  }

  /**
   * deprecated
   */
  public set isDirty(value: boolean) {
    if (!this._data.META) {
      this._data.META = { isDirty: value };
    }
    this._data.META.isDirty = value;
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
    const meta = getModelMeta(this);

    return [
      this._injectDynamicDbOffsets(meta.dbOffset),
      this.pluralName,
      this.data.id
    ].join("/");
  }

  /**
   * provides a boolean flag which indicates whether the underlying
   * model as a "dynamic path" which ultimately comes from a dynamic
   * component in the "dbOffset" property defined in the model decorator
   */
  public get hasDynamicPath() {
    return this.META.dbOffset.includes(":");
  }

  public get dynamicPathComponents() {
    if (!this.hasDynamicPath) {
      return [];
    }

    const results: string[] = [];
    let remaining = this.dbOffset;
    let index = remaining.indexOf(":");

    while (index !== -1) {
      remaining = remaining.slice(index);
      const prop = remaining.replace(/\:(\w+).*/, "$1");
      results.push(prop);
      remaining = remaining.replace(`:${prop}`, "");
      index = remaining.indexOf(":");
    }

    return results;
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
    return getModelMeta(this).dbOffset;
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
    return pathJoin(
      this.data.META.localOffset,
      this.pluralName,
      this.data.id
    ).replace(/\//g, ".");
  }

  public get existsOnDB() {
    return this.data && this.data.id ? true : false;
  }

  /** indicates whether this record is already being watched locally */
  public get isBeingWatched() {
    return FireModel.isBeingWatched(this.dbPath);
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
   * @param payload the data for the new record; this optionally can include the "id" but if left off the new record will use a firebase pushkey
   * @param options
   */
  public static async add<T extends Model>(
    model: new () => T,
    payload: ModelOptionalId<T>,
    options: IRecordOptions = {}
  ) {
    let r;
    try {
      r = Record.create(model, options);
      if (!payload.id) {
        (payload as T).id = fbKey();
      }
      r._initialize(payload as T);
      await r._adding();
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${e.message}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }

    return r;
  }

  /**
   * update
   *
   * update an existing record in the database
   *
   * @param schema the schema of the record
   * @param payload the data for the new record
   * @param options
   */
  public static async update<T extends Model>(
    model: new () => T,
    id: string,
    updates: Partial<T>,
    options: IRecordOptions = {}
  ) {
    let r;
    try {
      r = await Record.get(model, id, options);
      await r.update(updates);
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

  /**
   * get (static initializer)
   *
   * Allows the retrieval of records based on the record's id (and dynamic path prefixes
   * in cases where that applies)
   *
   * @param model the model definition you are retrieving
   * @param id either just an "id" string or in the case of models with dynamic path prefixes you can pass in an object with the id and all dynamic prefixes
   * @param options
   */
  public static async get<T extends Model>(
    model: new () => T,
    id: string | IIdWithDynamicPrefix,
    options: IRecordOptions = {}
  ) {
    const record = Record.create(model, options);
    if (typeof id === "object") {
      if (!id.id) {
        throw createError(
          "record/not-allowed",
          `Attempting to get a ${
            record.modelName
          } record where the ID and prefix hash did not include the "id" property! Properties that were sent in were: ${Object.keys(
            id
          )}`
        );
      }
      Object.keys(id).forEach(key => {
        (record.data as T)[key as keyof T] = (id as any)[key];
      });
      id = id.id;
    }
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

  //#region INSTANCE DEFINITION
  private _existsOnDB: boolean = false;
  private _writeOperations: IWriteOperation[] = [];
  private _data?: Partial<T>;

  constructor(model: new () => T, options: IRecordOptions = {}) {
    super();
    if (!model) {
      const e = new Error(
        `You can not construct a Record instance without passing in a Model's constructor! `
      );
      e.name = "FireModel::Forbidden";
      throw e;
    }
    this._modelConstructor = model;
    this._model = new model();
    this._data = new model();
  }

  /**
   * Goes out to the database and reloads this record
   */
  public async reload() {
    const reloaded = await Record.get(this._modelConstructor, this.id);
    return reloaded;
  }

  /**
   * addAnother
   *
   * Allows a simple way to add another record to the database
   * without needing the model's constructor fuction. Note, that
   * the payload of the existing record is ignored in the creation
   * of the new.
   *
   * @param payload the payload of the new record
   */
  public async addAnother(payload: T) {
    const newRecord = await Record.add(this._modelConstructor, payload);
    return newRecord;
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

    const relationships = getModelMeta(this).relationships;

    const hasOneRels = (relationships || [])
      .filter(r => r.relType === "hasOne")
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
    if (this.META.audit === true) {
      this._writeAudit("removed", []);
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

  public async associate(
    property: Extract<keyof T, string>,
    refs: Extract<fk, string> | Array<Extract<fk, string>>,
    optionalValue: any = true
  ) {
    if (this.META.relationship(property).relType === "hasOne") {
      if (!Array.isArray(refs)) {
        this.setRelationship(property, refs, optionalValue);
      } else {
        throw new Error(`Ref ${refs} must not be an array of strings.`);
      }
    } else if (this.META.relationship(property).relType === "hasMany") {
      this.addToRelationship(property, refs, optionalValue);
    }
  }

  public async disassociate(
    property: Extract<keyof T, string>,
    refs?: Extract<fk, string> | Array<Extract<fk, string>>
  ) {
    if (this.META.relationship(property).relType === "hasOne") {
      this.clearRelationship(property);
    } else if (this.META.relationship(property).relType === "hasMany") {
      this.removeFromRelationship(property, refs);
    }
  }

  /**
   * Adds one or more fk's to a hasMany relationship
   *
   * @param property the property which is acting as a foreign key (array)
   * @param fkRefs FK reference (or array of FKs) that should be added to reln
   * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead
   */
  public async addToRelationship(
    property: Extract<keyof T, string>,
    fkRefs: IFkReference | IFkReference[],
    optionalValue: any = true
  ) {
    this._errorIfNotHasManyReln(property, "addToRelationship");

    fkRefs = (Array.isArray(fkRefs) ? fkRefs : [fkRefs]) as IFkReference[];
    const now = new Date().getTime();
    const mps = this.db.multiPathSet("/");

    fkRefs.map(ref => {
      // adds appropriate paths to the MPS for both this model as well
      // as the foreign key being discussed
      this._relationshipMPS(mps, ref, property, optionalValue, now);
    });
    mps.add({ path: pathJoin(this.dbPath, "lastUpdated"), value: now });

    this.dispatch(
      this._createRecordEvent(
        this,
        FMEvents.RELATIONSHIP_ADDED_LOCALLY,
        mps.payload
      )
    );
    try {
      await mps.execute();
    } catch (e) {
      console.error("Errors in adding to relationship", e.errors);
      throw e;
    }
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED, this.data)
    );
  }

  /**
   * removeFromRelationship
   *
   * remove one or more IDs from a hasMany relationship
   *
   * @param property the property which is acting as a FK
   * @param fkRefs the IDs on the properties FK which should be removed
   */
  public async removeFromRelationship(
    property: Extract<keyof T, string>,
    fkRefs: IFkReference | IFkReference[]
  ) {
    this._errorIfNotHasManyReln(property, "removeFromRelationship");
    fkRefs = (Array.isArray(fkRefs) ? fkRefs : [fkRefs]) as IFkReference[];
    const now = new Date().getTime();
    const mps = this.db.multiPathSet("/");
    const inverseProperty = this.META.relationship(property).inverseProperty;
    mps.add({ path: pathJoin(this.dbPath, "lastUpdated"), value: now });
    fkRefs.map(ref => {
      this._relationshipMPS(mps, ref, property, null, now);
    });

    this.dispatch(
      this._createRecordEvent(
        this,
        FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
        mps.payload
      )
    );
    await mps.execute();
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED, this.data)
    );
  }

  // TODO: change this to be for hasOne and hasMany relationships
  /**
   * clearRelationship
   *
   * clears an existing FK on a hasOne relationship
   *
   * @param property the property containing the hasOne FK
   */
  public async clearRelationship(property: Extract<keyof T, string>) {
    this._errorIfNothasOneReln(property, "clearRelationship");
    if (!this.get(property)) {
      console.warn(
        `Call to clearRelationship(${property}) on model ${
          this.modelName
        } but there was no relationship set. This may be ok.`
      );
      return;
    }
    const mps = this.db.multiPathSet("/");

    this._relationshipMPS(
      mps,
      this.get(property) as any,
      property,
      null,
      new Date().getTime()
    );
    this.dispatch(
      this._createRecordEvent(
        this,
        FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
        mps.payload
      )
    );

    await mps.execute();
    this.dispatch(
      this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED, this.data)
    );
  }

  /**
   * setRelationship
   *
   * sets up an hasOne FK relationship
   *
   * @param property the property containing the hasOne FK
   * @param ref the FK
   */
  public async setRelationship(
    property: Extract<keyof T, string>,
    ref: Extract<fk, string>,
    optionalValue: any = true
  ) {
    this._errorIfNothasOneReln(property, "setRelationship");
    const mps = this.db.multiPathSet("/");

    this._relationshipMPS(
      mps,
      ref,
      property,
      optionalValue,
      new Date().getTime()
    );

    this.dispatch(
      this._createRecordEvent(
        this,
        FMEvents.RELATIONSHIP_ADDED_LOCALLY,
        mps.payload
      )
    );

    await mps.execute();

    this.dispatch(
      this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED, this.data)
    );
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

  protected _writeAudit(
    action: IAuditOperations,
    changes?: IAuditChange[],
    options: IModelOptions = {}
  ) {
    if (!changes || changes.length === 0) {
      changes = [];
      const meta = getModelMeta(this);
      meta.properties.map(p => {
        if (this.data[p.property as keyof T]) {
          changes.push({
            before: undefined,
            after: this.data[p.property as keyof T],
            property: p.property,
            action: "added"
          });
        }
      });
    }

    writeAudit(this.id, this.pluralName, action, changes, {
      ...options,
      db: this.db
    });
  }

  /**
   * _relationshipMPS
   *
   * Sets up and executes a multi-path SET (MPS) with the intent of
   * updating the FK relationship of a given model as well as reflecting
   * that change back from the FK to the originating model
   *
   * @param mps the multi-path selection object
   * @param fkRef a FK reference; either a string (representing the ID of other
   * record) or a composite key (ID plus all dynamic segments)
   * @param property the property on the target record which contains FK(s)
   * @param value the value to set this FK (null removes); typically TRUE if setting
   * @param now the current time in miliseconds
   */
  protected _relationshipMPS(
    mps: any,
    fkRef: IFkReference,
    property: Extract<keyof T, string>,
    value: any,
    now: number
  ) {
    const meta = getModelMeta(this);
    const fkModelConstructor = meta.relationship(property).fkConstructor();
    const inverseProperty = meta.relationship(property).inverseProperty;
    const fkRecord = Record.create(fkModelConstructor);
    const fkRecordData = typeof fkRef === "object" ? fkRef : { id: fkRef };
    fkRecord._initialize({ ...fkRecord.data, ...fkRecordData });
    let fkId: string;

    // DEAL WITH DYNAMIC PATHS on FK
    if (fkRecord.hasDynamicPath) {
      const fkDynamicProps = fkRecord.dynamicPathComponents;
      /**
       * Sometimes the current model has all the properties needed
       * to populate the FK's dynamic path. This boolean flag indicates
       * whether that is the case.
       */
      const canAutoPopulate = fkDynamicProps.every(
        p =>
          this.data[p as keyof T] !== undefined ||
          this.data[p as keyof T] !== null
      )
        ? true
        : false;
      /**
       * This flag indicates whether the ref passed in just a simple string reference
       * to the FK model (false) or if it is a hash which represents
       * the composite FK reference.
       */
      const refIsCompositeKey = typeof fkRef === "object" ? true : false;
      /** a hash of props and values */
      const selfSourcedDynamicValues: IDictionary = fkRecord.dynamicPathComponents.reduce(
        (prev, curr) => ({ ...prev, [curr]: this.data[curr as keyof T] }),
        {}
      );

      const propData = refIsCompositeKey
        ? (fkRef as ICompositeKey)
        : canAutoPopulate
          ? { ...selfSourcedDynamicValues, id: fkRef as string }
          : false;
      if (!propData) {
        throw createError(
          "record/insufficient-data",
          `Attempt to add/remove a FK relationship on ${this.modelName} to ${
            fkRecord.modelName
          } failed because there was no way to resolve ${
            fkRecord.modelName
          }'s dynamic prefixes: [ ${fkDynamicProps} ]`
        );
      }

      fkId =
        propData.id +
        Object.keys(propData)
          .filter(k => k !== "id")
          .map(k => `::${k}:${propData[k]}`);
    } else {
      if (typeof fkRef === "object") {
        throw createError(
          `record/invalid-key`,
          `When attempting to change the relationship between the originating model "${
            this.modelName
          }" and the foreign model "${fkRecord.modelName}" the reference to ${
            fkRecord.modelName
          } was expressed as Composite Key but ${
            fkRecord.modelName
          } does not have any dynamic segments.`
        );
      }
      fkId = fkRef;
    }

    const hasManyReln =
      meta.isRelationship(property) &&
      meta.relationship(property).relType === "hasMany";
    const pathToThisFkReln = pathJoin(
      this.dbPath, // this includes dynamic segments for originating model
      property,
      hasManyReln ? fkId : ""
    );
    addModelMeta(fkRecord.modelName, fkRecord.META);

    // Add paths for primary model to FK in MPS
    mps.add({ path: pathToThisFkReln, value: hasManyReln ? value : fkId });

    // INVERSE RELATIONSHIP
    if (inverseProperty) {
      const fkMeta = getModelMeta(fkRecord);
      const hasRecipricalInverse =
        fkMeta.relationship(inverseProperty).inverseProperty === property;
      if (!hasRecipricalInverse) {
        console.warn(
          `The FK "${property}" on ${
            this.modelName
          } has an inverse property set of "${inverseProperty}" but on the reference model [ ${
            fkRecord.modelName
          } ] there is NOT a reciprocal inverse set! [ ${
            fkMeta.relationship(inverseProperty).inverseProperty
              ? fkMeta.relationship(inverseProperty).inverseProperty +
                " was set instead"
              : "no inverse set"
          } ]`
        );
      }
      const pathToInverseFkReln = inverseProperty
        ? pathJoin(fkRecord.dbPath, inverseProperty)
        : null;

      const fkInverseIsHasManyReln = inverseProperty
        ? fkMeta.relationship(inverseProperty).relType === "hasMany"
        : false;

      mps.add({
        path: fkInverseIsHasManyReln
          ? pathJoin(pathToInverseFkReln, this.id)
          : pathToInverseFkReln,
        value: !fkInverseIsHasManyReln
          ? value // TODO: there should be variance between 1:1 and 1:M
          : { [createCompositeKey(fkRecord, value)]: value }
      });

      mps.add({
        path: pathJoin(fkRecord.dbPath, "lastUpdated"),
        value: now
      });
    }
    if (
      typeof this.data[property] === "object" &&
      (this.data[property] as any)[fkId]
    ) {
      console.warn(
        `The fk reference "${fkId}" already exists in "${
          this.modelName
        }.${property}"!`
      );
      return;
    }
  }

  protected _errorIfNothasOneReln(
    property: Extract<keyof T, string>,
    fn: string
  ) {
    if (this.META.relationship(property).relType !== "hasOne") {
      const e = new Error(
        `Can not use property "${property}" on ${
          this.modelName
        } with ${fn}() because it is not a hasOne relationship [ relType: ${
          this.META.relationship(property).relType
        }, inverse: ${
          this.META.relationship(property).inverse
        } ]. If you are working with a hasMany relationship then you should instead use addRelationship() and removeRelationship().`
      );
      e.name = "FireModel::WrongRelationshipType";
      throw e;
    }
  }

  protected _errorIfNotHasManyReln(
    property: Extract<keyof T, string>,
    fn: string
  ) {
    if (this.META.relationship(property).relType !== "hasMany") {
      const e = new Error(
        `Can not use property "${property}" on ${
          this.modelName
        } with ${fn}() because it is not a hasMany relationship [ relType: ${
          this.META.relationship(property).relType
        }, inverse: ${
          this.META.relationship(property).inverseProperty
        } ]. If you are working with a hasOne relationship then you should instead use setRelationship() and clearRelationship().`
      );
      e.name = "FireModel::WrongRelationshipType";
      throw e;
    }
  }

  protected async _updateProps<K extends IFMEventName<K>>(
    actionTypeStart: K,
    actionTypeEnd: K,
    changed: Partial<T>
  ) {
    this.isDirty = true;
    const priorValues: Partial<T> = {};
    Object.keys(changed).map((prop: Extract<string, keyof T>) => {
      priorValues[prop] = this._data[prop];
      this._data[prop] = changed[prop];
    });
    const paths = this._getPaths(changed);

    this.dispatch(this._createRecordEvent(this, actionTypeStart, paths));

    const mps = this.db.multiPathSet(this.dbPath);
    paths.map(path => mps.add(path));
    await mps.execute();
    this.isDirty = false;
    this._data.lastUpdated = new Date().getTime();
    if (this.META.audit === true) {
      const action = Object.keys(priorValues).every(
        (i: Extract<keyof T, string>) => !priorValues[i]
      )
        ? "added"
        : "updated";
      const changes = Object.keys(changed).reduce<IAuditChange[]>(
        (prev: IAuditChange[], curr: Extract<keyof T, string>) => {
          const after = changed[curr];
          const before = priorValues[curr];
          const propertyAction = !before
            ? "added"
            : !after
              ? "removed"
              : "updated";
          const payload: IAuditChange = {
            before,
            after,
            property: curr,
            action: propertyAction
          };
          prev.push(payload);
          return prev;
        },
        []
      );

      writeAudit(
        this.id,
        this.pluralName,
        action,
        updateToAuditChanges(changed, priorValues),
        { db: this.db }
      );
    }

    // if this path is being watched we should avoid
    // sending a duplicative event
    if (!this.isBeingWatched) {
      this.dispatch(this._createRecordEvent(this, actionTypeEnd, this.data));
    }
  }

  /**
   * looks for ":name" property references within the dbOffset and expands them
   */
  private _injectDynamicDbOffsets(dbOffset: string) {
    this.dynamicPathComponents.forEach(prop => {
      const value = this.data[prop as keyof T];
      if (!value) {
        throw createError(
          "record/invalid-path",
          `Invalid Record Path: you can not ask for the dbPath on a model like ${
            this.modelName
          } which has a dynamic property of "${prop}" before setting that property.`
        );
      }
      if (typeof value !== "string" && typeof value !== "number") {
        throw createError(
          "record/not-allowed",
          `The path is using the property "${prop}" on ${
            this.modelName
          } as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`
        );
      }
      dbOffset = dbOffset.replace(
        `:${prop}`,
        String(this.get(prop as keyof T))
      );
    });

    return dbOffset;
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

  private async _adding() {
    if (!this.id) {
      this.id = fbKey();
    }
    if (this.META.audit === true) {
      // TODO: Fix
      this._writeAudit("added", []);
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
      this.dispatch(
        this._createRecordEvent(this, FMEvents.RECORD_ADDED, this.data)
      );
    }

    return this;
  }

  //#endregion
}
