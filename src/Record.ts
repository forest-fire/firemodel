// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Model } from "./Model";
import { createError, IDictionary, Omit, Nullable, fk } from "common-types";
import { key as fbKey } from "firebase-key";
import { FireModel } from "./FireModel";
import {
  IReduxDispatch,
  IFmLocalRecordEvent,
  IWatcherEventContext
} from "./state-mgmt";
import { buildDeepRelationshipLinks } from "./record/buildDeepRelationshipLinks";

import {
  FmEvents,
  IFMEventName,
  IFmCrudOperations,
  IFmDispatchOptions
} from "./state-mgmt/index";
import { pathJoin } from "./path";
import { getModelMeta } from "./ModelMeta";
import { writeAudit, IAuditChange, IAuditOperations } from "./Audit";
import { compareHashes, withoutMetaOrPrivate, capitalize } from "./util";
import {
  IFkReference,
  ICompositeKey,
  IRecordOptions
} from "./@types/record-types";

import {
  IFmModelPropertyMeta,
  IFmRelationshipOptionsForHasMany,
  createCompositeKey
} from ".";
import { findWatchers } from "./watchers/findWatchers";
import { isHasManyRelationship } from "./verifications/isHasManyRelationship";
import {
  NotHasManyRelationship,
  NotHasOneRelationship,
  FireModelError,
  FireModelProxyError
} from "./errors";
import { buildRelationshipPaths } from "./record/relationships/buildRelationshipPaths";
import { relationshipOperation } from "./record/relationshipOperation";
import { createCompositeKeyRefFromRecord } from "./record/createCompositeKeyString";
import { IFmPathValuePair, IFmRelationshipOptions } from "./@types";
import { createCompositeKeyFromFkString } from "./record/createCompositeKeyFromFkString";
import { RecordCrudFailure } from "./errors/record/DatabaseCrudFailure";
import { IFmModelMeta } from "./decorators";
import copy from "fast-copy";
import { WatchDispatcher } from "./watchers/WatchDispatcher";
import { UnwatchedLocalEvent } from "./state-mgmt/UnwatchedLocalEvent";

/**
 * a Model that doesn't require the ID tag (or the META tag which not a true
 * property of the model)
 * */
export type ModelOptionalId<T extends Model> = Omit<T, "id" | "META"> & {
  id?: string;
  META?: IFmModelMeta;
};

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
   * **dynamicPathProperties**
   *
   * An array of "dynamic properties" that are derived fom the "dbOffset" to
   * produce the "dbPath". Note: this does NOT include the `id` property.
   */
  public static dynamicPathProperties<T extends Model = Model>(
    /**
     * the **Model** who's properties are being interogated
     */
    model: new () => T
  ) {
    return Record.create(model).dynamicPathComponents;
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
    if (this.data.id ? false : true) {
      throw createError(
        "record/not-ready",
        `you can not ask for the dbPath before setting an "id" property [ ${this.modelName} ]`
      );
    }

    return [
      this._injectDynamicPathProperties(this.dbOffset),
      this.pluralName,
      this.data.id
    ].join("/");
  }

  /**
   * provides a boolean flag which indicates whether the underlying
   * model has a "dynamic path" which ultimately comes from a dynamic
   * component in the "dbOffset" property defined in the model decorator
   */
  public get hasDynamicPath() {
    return this.META.dbOffset.includes(":");
  }

  /**
   * **dynamicPathComponents**
   *
   * An array of "dynamic properties" that are derived fom the "dbOffset" to
   * produce the "dbPath"
   */
  public get dynamicPathComponents() {
    return this._findDynamicComponents(this.META.dbOffset);
  }

  /**
   * the list of dynamic properties in the "localPrefix"
   * which must be resolved to achieve the "localPath"
   */
  public get localDynamicComponents() {
    return this._findDynamicComponents(this.META.localPrefix);
  }

  /**
   * A hash of values -- including at least "id" -- which represent
   * the composite key of a model.
   */
  public get compositeKey(): ICompositeKey<T> {
    return createCompositeKey<T>(this);
  }

  /**
   * a string value which is used in relationships to fully qualify
   * a composite string (aka, a model which has a dynamic dbOffset)
   */
  public get compositeKeyRef() {
    return createCompositeKeyRefFromRecord<T>(this);
  }

  /**
   * The Record's primary key; this is the `id` property only. Not
   * the composite key.
   */
  public get id(): string {
    return this.data.id;
  }

  /**
   * Allows setting the Record's `id` if it hasn't been set before.
   * Resetting the `id` is not allowed.
   */
  public set id(val: string) {
    if (this.data.id) {
      throw new FireModelError(
        `You may not re-set the ID of a record [ ${this.modelName}.id ${this.data.id} => ${val} ].`,
        "firemodel/not-allowed"
      );
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
   * this can include dynamic properties characterized in the path string by
   * leading ":" character.
   */
  public get localPath() {
    let prefix = this.localPrefix;
    this.localDynamicComponents.forEach(prop => {
      prefix = prefix.replace(`:${prop}`, this.get(prop as any));
    });
    return pathJoin(
      prefix,
      this.META.localModelName !== this.modelName
        ? this.META.localModelName
        : this.options.pluralizeLocalPath
        ? this.pluralName
        : this.modelName
    );
  }

  /**
   * The path in the local state tree that brings you to
   * the record; this is differnt when retrieved from a
   * Record versus a List.
   */
  public get localPrefix() {
    return getModelMeta(this).localPrefix;
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
      throw new FireModelError(
        `You can only add new records to the DB silently when using a Mock database!`,
        "forbidden"
      );
    }

    return r;
  }

  /**
   * Creates an empty record and then inserts all values
   * provided along with default values provided in META.
   */
  public static local<T extends Model>(
    model: new () => T,
    values: Partial<T>,
    options: IRecordOptions & { ignoreEmptyValues?: boolean } = {}
  ) {
    const rec = Record.create(model, options as IRecordOptions);
    if (
      !options.ignoreEmptyValues &&
      (!values || Object.keys(values).length === 0)
    ) {
      throw createError(
        `firemodel/record::local`,
        "You used the static Record.local() method but passed nothing into the 'values' property! If you just want to skip this error then you can set the options to { ignoreEmptyValues: true } or just use the Record.create() method."
      );
    }

    if (values) {
      const defaultValues = rec.META.properties.filter(
        i => i.defaultValue !== undefined
      );

      // also include "default values"
      defaultValues.forEach((i: IFmModelPropertyMeta<T>) => {
        if (rec.get(i.property) === undefined) {
          rec.set(i.property, i.defaultValue, true);
        }
      });
    }

    return rec;
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
    model: (new () => T) | string,
    payload: ModelOptionalId<T>,
    options: IRecordOptions = {}
  ) {
    let r: Record<T>;
    if (typeof model === "string") {
      model = FireModel.lookupModel(model);
    }
    try {
      if (!model) {
        throw new FireModelError(
          `The model passed into the Record.add() static initializer was not defined! This is often the result of a circular dependency. Note that the "payload" sent into Record.add() was:\n\n${JSON.stringify(
            payload,
            null,
            2
          )}`
        );
      }
      r = Record.createWith(model, payload as Partial<T>, options);

      if (!payload.id) {
        payload.id = r.db.isMockDb
          ? fbKey()
          : await r.db.getPushKey(r.dbOffset);
      }

      await r._initialize(payload as T, options);
      const defaultValues = r.META.properties.filter(
        i => i.defaultValue !== undefined
      );
      defaultValues.forEach((i: IFmModelPropertyMeta<T>) => {
        if (r.get(i.property) === undefined) {
          r.set(i.property, i.defaultValue, true);
        }
      });

      await r._adding(options);
    } catch (e) {
      if (e.code === "permission-denied") {
        const rec = Record.createWith(model, payload as Partial<T>);
        throw new FireModelError(
          `Permission error while trying to add the ${capitalize(
            rec.modelName
          )} to the database path ${rec.dbPath}`,
          "firemodel/permission-denied"
        );
      }

      if (e.name.includes("firemodel")) {
        throw e;
      }

      throw new FireModelProxyError(e, "Failed to add new record ");
    }

    return r;
  }

  /**
   * **update**
   *
   * update an existing record in the database with a dictionary of prop/value pairs
   *
   * @param model the _model_ type being updated
   * @param id the `id` for the model being updated
   * @param updates properties to update; this is a non-destructive operation so properties not expressed will remain unchanged. Also, because values are _nullable_ you can set a property to `null` to REMOVE it from the database.
   * @param options
   */
  public static async update<T extends Model>(
    model: new () => T,
    id: string | ICompositeKey<T>,
    updates: Nullable<Partial<T>>,
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
   * **createWith**
   *
   * A static initializer that creates a Record of a given class
   * and then initializes the state with either a Model payload
   * or a CompositeKeyString (aka, '[id]::[prop]:[value]').
   *
   * You should be careful in using this initializer; the expected
   * _intents_ include:
   *
   * 1. to initialize an in-memory record of something which is already
   * in the DB
   * 2. to get all the "composite key" attributes into the record so
   * all META queries are possible
   *
   * If you want to add this record to the database then use `add()`
   * initializer instead.
   *
   * @prop model a constructor for the underlying model
   * @payload either a string representing an `id` or Composite Key or alternatively
   * a hash/dictionary of attributes that are to be set as a starting point
   */
  public static createWith<T extends Model>(
    model: new () => T,
    payload: Partial<T> | string,
    options: IRecordOptions = {}
  ) {
    const rec = Record.create(model, options);

    if (options.setDeepRelationships === true) {
      throw new FireModelError(
        `Trying to create a ${capitalize(
          rec.modelName
        )} with the "setDeepRelationships" property set. This is NOT allowed; consider the 'Record.add()' method instead.`,
        "not-allowed"
      );
    }
    const properties: Partial<T> =
      typeof payload === "string"
        ? createCompositeKeyFromFkString(payload, rec.modelConstructor)
        : payload;
    // TODO: build some tests to ensure that ...
    // the async possibilites of this method (only if `options.setDeepRelationships`)
    // are not negatively impacting this method
    rec._initialize(properties, options);

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
    id: string | ICompositeKey<T>,
    options: IRecordOptions = {}
  ) {
    const record = Record.create(model, options);
    await record._getFromDB(id);
    return record;
  }

  public static async remove<T extends Model>(
    model: new () => T,
    id: IFkReference<T>,
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
  private _data?: Partial<T> = {};

  constructor(model: new () => T, protected options: IRecordOptions = {}) {
    super();
    if (!model) {
      throw new FireModelError(
        `You are trying to instantiate a Record but the "model constructor" passed in is empty!`,
        `firemodel/not-allowed`
      );
    }

    if (!model.constructor) {
      console.log(
        `The "model" property passed into the Record constructor is NOT a Model constructor! It is of type "${typeof model}": `,
        model
      );
      if (typeof model === "string") {
        model = FireModel.lookupModel(model);
        if (!model) {
          throw new FireModelError(
            `Attempted to lookup the model in the registry but it was not found!`
          );
        }
      } else {
        throw new FireModelError(
          `Can not instantiate a Record without a valid Model constructor`
        );
      }
    }
    this._modelConstructor = model;
    this._model = new model();
    this._data = new model();
  }

  public get modelConstructor() {
    return this._modelConstructor;
  }

  /**
   * Goes out to the database and reloads this record
   */
  public async reload() {
    const reloaded = await Record.get(
      this._modelConstructor,
      this.compositeKeyRef
    );
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
  public async addAnother(payload: T, options: IRecordOptions = {}) {
    const newRecord = await Record.add(
      this._modelConstructor,
      payload,
      options
    );
    return newRecord;
  }

  public isSameModelAs(model: new () => any) {
    return this._modelConstructor === model;
  }

  /**
   * Allows an empty Record to be initialized to a known state.
   * This is not intended to allow for mass property manipulation other
   * than at time of initialization
   *
   * @param data the initial state you want to start with
   */
  public async _initialize(
    data: Partial<T>,
    options: IRecordOptions = {}
  ): Promise<void> {
    if (data) {
      Object.keys(data).map(key => {
        this._data[key as keyof T] = data[key as keyof T];
      });
    }

    const relationships = getModelMeta(this).relationships;
    const hasOneRels: Array<keyof T> = (relationships || [])
      .filter(r => r.relType === "hasOne")
      .map(r => r.property) as Array<keyof T>;
    const hasManyRels: Array<keyof T> = (relationships || [])
      .filter(r => r.relType === "hasMany")
      .map(r => r.property) as Array<keyof T>;

    /**
     * Sets hasMany to default `{}` if nothing was set.
     * Also, if the option `deepRelationships` is set to `true`,
     * it will look for relationships hashes instead of the typical
     * `fk: true` pairing.
     */
    for await (const oneToManyProp of hasManyRels) {
      if (!this._data[oneToManyProp]) {
        (this._data as any)[oneToManyProp] = {};
      }
      if (options.setDeepRelationships) {
        if (this._data[oneToManyProp]) {
          await buildDeepRelationshipLinks(this, oneToManyProp);
        }
      }
    }

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
  public async pushKey<K extends keyof T, Object>(
    property: K,
    value: T[K][keyof T[K]] | any
  ): Promise<fk> {
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
    const key = this.db.isMockDb
      ? fbKey()
      : await this.db.getPushKey(pathJoin(this.dbPath, property));
    await this.db.set(pathJoin(this.dbPath, property), value);
    await this.db.set(
      pathJoin(this.dbPath, "lastUpdated"),
      new Date().getTime()
    );
    // set firemodel state locally
    const currentState = this.get(property) || {};
    const newState = { ...(currentState as any), [key]: value };
    this.set(property, newState);

    return key;
  }

  /**
   * **update**
   *
   * Updates a set of properties on a given model atomically (aka, all at once);
   * will automatically include the "lastUpdated" property. Does NOT
   * allow relationships to be included, this should be done separately.
   *
   * If you want to remove a particular property but otherwise leave the object
   * unchanged, you can set that values(s) to NULL and it will be removed without
   * impact to other properties.
   *
   * @param props a hash of name value pairs which represent the props being
   * updated and their new values
   */
  public async update(props: Nullable<Partial<T>>) {
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
      throw new FireModelError(
        `You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(
          ", "
        )}.`,
        `firemodel/not-allowed`
      );
    }

    const lastUpdated = new Date().getTime();
    const changed: any = {
      ...props,
      lastUpdated
    };
    const rollback = copy(this.data);
    // changes local Record to include updates immediately
    this._data = { ...this.data, ...changed };

    // performs a two phase commit using dispatch messages
    await this._localCrudOperation(IFmCrudOperations.update, rollback);

    return;
  }

  /**
   * **remove**
   *
   * Removes the active record from the database and dispatches the change to
   * FE State Mgmt.
   */
  public async remove() {
    this.isDirty = true;
    await this._localCrudOperation(IFmCrudOperations.remove, copy(this.data));
    this.isDirty = false;
  }

  /**
   * Changes the local state of a property on the record
   *
   * @param prop the property on the record to be changed
   * @param value the new value to set to
   * @param silent a flag to indicate whether the change to the prop should be updated to the database or not
   */
  public async set<K extends keyof T>(
    prop: K,
    value: T[K],
    silent: boolean = false
  ) {
    const rollback = copy(this.data);
    const meta = this.META.property(prop);
    if (!meta) {
      throw new FireModelError(
        `There was a problem getting the meta data for the model ${capitalize(
          this.modelName
        )} while attempting to set the "${prop}" property to: ${value}`
      );
    }
    if (meta.isRelationship) {
      throw new FireModelError(
        `You can not "set" the property "${prop}" because it is configured as a relationship!`,
        "firemodel/not-allowed"
      );
    }
    const lastUpdated = new Date().getTime();
    const changed: any = {
      [prop]: value,
      lastUpdated
    };
    // locally change Record values
    this.META.isDirty = true;
    this._data = { ...this._data, ...changed };
    // dispatch
    if (!silent) {
      await this._localCrudOperation(IFmCrudOperations.update, rollback, {
        silent
      });
      this.META.isDirty = false;
    }

    return;
  }

  /**
   * **associate**
   *
   * Associates the current model with another entity
   * regardless if the cardinality
   */
  public async associate(
    property: Extract<keyof T, string>,
    refs: IFkReference<T> | Array<IFkReference<T>>,
    options: IFmRelationshipOptions = {}
  ) {
    const meta = getModelMeta(this);
    if (!meta.relationship(property)) {
      throw new FireModelError(
        `Attempt to associate the property "${property}" can not be done on model ${capitalize(
          this.modelName
        )} because the property is not defined!`,
        `firemodel/not-allowed`
      );
    }
    if (!meta.relationship(property).relType) {
      throw new FireModelError(
        `For some reason the property "${property}" on the model ${capitalize(
          this.modelName
        )} doesn't have cardinality assigned to the "relType" (aka, hasMany, hasOne).\n\nThe META for relationships on the model are: ${JSON.stringify(
          meta.relationships,
          null,
          2
        )}`,
        `firemodel/unknown`
      );
    }
    const relType = meta.relationship(property).relType;
    if (relType === "hasMany") {
      await this.addToRelationship(property, refs, options);
    } else {
      if (Array.isArray(refs)) {
        if (refs.length === 1) {
          refs = refs.pop();
        } else {
          throw new FireModelError(
            `Attempt to use "associate()" with a "hasOne" relationship [ ${property}] on the model ${capitalize(
              this.modelName
            )}.`,
            "firemodel/invalid-cardinality"
          );
        }
      }
      await this.setRelationship(property, refs, options);
    }
  }

  /**
   * **disassociate**
   *
   * Removes an association between the current model and another entity
   * (regardless of the cardinality in the relationship)
   */
  public async disassociate(
    property: Extract<keyof T, string>,
    refs: IFkReference<T> | Array<IFkReference<T>>,
    options: IFmRelationshipOptions = {}
  ) {
    const relType = this.META.relationship(property).relType;
    if (relType === "hasMany") {
      await this.removeFromRelationship(property, refs, options);
    } else {
      await this.clearRelationship(property, options);
    }
  }

  /**
   * Adds one or more fk's to a hasMany relationship.
   *
   * Every relationship will be added as a "single transaction", meaning that ALL
   * or NONE of the relationshiop transactions will succeed. If you want to
   * take a more optimistic approach that accepts each relationship pairing (PK/FK)
   * then you should manage the iteration outside of this call and let this call
   * only manage the invidual PK/FK transactions (which should ALWAYS be atomic).
   *
   * @param property the property which is acting as a foreign key (array)
   * @param fkRefs FK reference (or array of FKs) that should be added to reln
   * @param options change the behavior of this relationship transaction
   */
  public async addToRelationship(
    property: keyof T,
    fkRefs: IFkReference<T> | Array<IFkReference<T>>,
    options: IFmRelationshipOptionsForHasMany = {}
  ) {
    const altHasManyValue = options.altHasManyValue || true;

    if (!isHasManyRelationship(this, property)) {
      throw new NotHasManyRelationship(
        this,
        property as string,
        "addToRelationship"
      );
    }

    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths: IFmPathValuePair[] = [];

    const now = new Date().getTime();
    fkRefs.map(ref => {
      paths = [
        ...buildRelationshipPaths(this, property, ref, {
          now,
          altHasManyValue
        }),
        ...paths
      ];
    });

    await relationshipOperation(this, "add", property, fkRefs, paths, options);
  }

  /**
   * removeFromRelationship
   *
   * remove one or more FK's from a `hasMany` relationship
   *
   * @param property the property which is acting as a FK
   * @param fkRefs the FK's on the property which should be removed
   */
  public async removeFromRelationship(
    property: Extract<keyof T, string>,
    fkRefs: IFkReference<T> | Array<IFkReference<T>>,
    options: IFmRelationshipOptionsForHasMany = {}
  ) {
    if (!isHasManyRelationship(this, property)) {
      throw new NotHasManyRelationship(
        this,
        property,
        "removeFromRelationship"
      );
    }

    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths: IFmPathValuePair[] = [];

    const now = new Date().getTime();
    fkRefs.map(ref => {
      paths = [
        ...buildRelationshipPaths(this, property, ref, {
          now,
          operation: "remove"
        }),
        ...paths
      ];
    });

    await relationshipOperation(
      this,
      "remove",
      property,
      fkRefs,
      paths,
      options
    );
  }

  /**
   * **clearRelationship**
   *
   * clears an existing FK on a `hasOne` relationship or _all_ FK's on a
   * `hasMany` relationship
   *
   * @param property the property containing the relationship to an external
   * entity
   */
  public async clearRelationship(
    property: Extract<keyof T, string>,
    options: IFmRelationshipOptions = {}
  ) {
    const relType = this.META.relationship(property).relType;
    const fkRefs: string[] =
      relType === "hasMany"
        ? this._data[property]
          ? Object.keys(this.get(property))
          : []
        : this._data[property]
        ? [(this.get(property) as unknown) as string]
        : [];

    let paths: IFmPathValuePair[] = [];
    const now = new Date().getTime();

    fkRefs.map(ref => {
      paths = [
        ...buildRelationshipPaths(this, property, ref, {
          now,
          operation: "remove"
        }),
        ...paths
      ];
    });

    await relationshipOperation(
      this,
      "clear",
      property,
      fkRefs,
      paths,
      options
    );
  }

  /**
   * **setRelationship**
   *
   * sets up an FK relationship for a _hasOne_ relationship
   *
   * @param property the property containing the hasOne FK
   * @param ref the FK
   */
  public async setRelationship(
    property: Extract<keyof T, string>,
    fkId: IFkReference<T>,
    options: IFmRelationshipOptions = {}
  ) {
    if (!fkId) {
      throw new FireModelError(
        `Failed to set the relationship ${this.modelName}.${property} because no FK was passed in!`,
        "firemodel/not-allowed"
      );
    }

    if (isHasManyRelationship(this, property)) {
      throw new NotHasOneRelationship(this, property, "setRelationship");
    }
    const paths = buildRelationshipPaths(this, property, fkId);
    await relationshipOperation(this, "set", property, [fkId], paths, options);
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
      compositeKey: this.compositeKey,
      localPath: this.localPath,
      data: this.data.toString()
    };
  }

  /**
   * **_writeAudit**
   *
   * Writes an audit log if the record is configured for audit logs
   */
  protected async _writeAudit(
    action: IFmCrudOperations,
    currentValue: Partial<T>,
    priorValue: Partial<T>
  ) {
    currentValue = currentValue ? currentValue : {};
    priorValue = priorValue ? priorValue : {};
    try {
      if (this.META.audit) {
        const deltas = compareHashes<T>(currentValue, priorValue);
        const auditLogEntries: IAuditChange[] = [];
        const added = deltas.added.forEach(a =>
          auditLogEntries.push({
            action: "added",
            property: a,
            before: null,
            after: currentValue[a]
          })
        );
        deltas.changed.forEach(c =>
          auditLogEntries.push({
            action: "updated",
            property: c,
            before: priorValue[c],
            after: currentValue[c]
          })
        );
        const removed = deltas.removed.forEach(r =>
          auditLogEntries.push({
            action: "removed",
            property: r,
            before: priorValue[r],
            after: null
          })
        );

        const pastTense = {
          add: "added",
          update: "updated",
          remove: "removed"
        };

        await writeAudit(
          this.id,
          this.pluralName,
          pastTense[action] as IAuditOperations,
          auditLogEntries,
          { db: this.db }
        );
      }
    } catch (e) {
      throw new FireModelProxyError(e);
    }
  }

  /**
   * **_localCrudOperation**
   *
   * updates properties on a given Record while firing
   * two-phase commit EVENTs to dispatch:
   *
   *  local: `RECORD_[ADDED,CHANGED,REMOVED]_LOCALLY`
   *  server: `RECORD_[ADDED,CHANGED,REMOVED]_CONFIRMATION`
   *
   * Note: if there is an error a
   * `RECORD_[ADDED,CHANGED,REMOVED]_ROLLBACK` event will be sent
   * to dispatch instead of the server dispatch message
   * illustrated above.
   *
   * Another concept that is sometimes not clear ... when a
   * successful transaction is achieved you will by default get
   * both sides of the two-phase commit. If you have a watcher
   * watching this same path then that watcher will also get
   * a dispatch message sent (e.g., RECORD_ADDED, RECORD_REMOVED, etc).
   *
   * If you only want to hear about Firebase's acceptance of the
   * record from a watcher then you can opt-out by setting the
   * { silentAcceptance: true } parameter in options. If you don't
   * want either side of the two phase commit sent to dispatch
   * you can mute both with { silent: true }. This option is not
   * typically a great idea but it can be useful in situations like
   * _mocking_
   */
  protected async _localCrudOperation<K extends IFMEventName<K>>(
    crudAction: IFmCrudOperations,
    priorValue: T,
    options: IFmDispatchOptions = {}
  ) {
    options = {
      ...{ silent: false, silentAcceptance: false },
      ...options
    };
    const transactionId: string =
      "t-" +
      Math.random()
        .toString(36)
        .substr(2, 5) +
      "-" +
      Math.random()
        .toString(36)
        .substr(2, 5);
    const lookup: IDictionary<FmEvents[]> = {
      add: [
        FmEvents.RECORD_ADDED_LOCALLY,
        FmEvents.RECORD_ADDED_CONFIRMATION,
        FmEvents.RECORD_ADDED_ROLLBACK
      ],
      update: [
        FmEvents.RECORD_CHANGED_LOCALLY,
        FmEvents.RECORD_CHANGED_CONFIRMATION,
        FmEvents.RECORD_CHANGED_ROLLBACK
      ],
      remove: [
        FmEvents.RECORD_REMOVED_LOCALLY,
        FmEvents.RECORD_REMOVED_CONFIRMATION,
        FmEvents.RECORD_REMOVED_ROLLBACK
      ]
    };
    const [actionTypeStart, actionTypeEnd, actionTypeFailure] = lookup[
      crudAction
    ];

    this.isDirty = true;
    // Set aside prior value
    const { changed, added, removed } = compareHashes<Partial<T>>(
      withoutMetaOrPrivate<T>(this.data),
      withoutMetaOrPrivate<T>(priorValue)
    );

    const watchers: Array<IWatcherEventContext<T>> = findWatchers(
      this.dbPath
    ) as any;
    const event: Omit<IFmLocalRecordEvent<T>, "type"> = {
      transactionId,
      modelConstructor: this.modelConstructor,
      kind: "record",
      operation: crudAction,
      eventType: "local",
      key: this.id,
      value: withoutMetaOrPrivate<T>(this.data),
      priorValue
    };

    if (crudAction === "update") {
      event.priorValue = priorValue as T;
      event.added = added;
      event.changed = changed;
      event.removed = removed;
    }

    if (watchers.length === 0) {
      if (!options.silent) {
        // Note: if used on frontend, the mutations must be careful to
        // set this to the right path considering there is no watcher
        await this.dispatch(
          UnwatchedLocalEvent(this, {
            type: actionTypeStart,
            ...event,
            value: withoutMetaOrPrivate(this.data)
          })
        );
      }
    } else {
      // For each watcher watching this DB path ...
      const dispatch = WatchDispatcher<T>(this.dispatch);
      for (const watcher of watchers) {
        if (!options.silent) {
          await dispatch(watcher)({ type: actionTypeStart, ...event });
        }
      }
    }

    // Send CRUD to Firebase
    try {
      if (this.db.isMockDb && options.silent) {
        this.db.mock.silenceEvents();
      }
      this._data.lastUpdated = new Date().getTime();
      const path = this.dbPath;

      switch (crudAction) {
        case "remove":
          await this.db.remove(this.dbPath);
          break;
        case "add":
          await this.db.set(path, this.data);
          break;
        case "update":
          const paths = this._getPaths(this, { changed, added, removed });
          this.db.update("/", paths);
          break;
      }

      this.isDirty = false;

      // write audit if option is turned on
      this._writeAudit(crudAction, this.data, priorValue);

      // send confirm event
      if (!options.silent && !options.silentAcceptance) {
        if (watchers.length === 0) {
          await this.dispatch(
            UnwatchedLocalEvent(this, {
              type: actionTypeEnd,
              ...event,
              transactionId,
              value: withoutMetaOrPrivate(this.data)
            })
          );
        } else {
          const dispatch = WatchDispatcher<T>(this.dispatch);
          for (const watcher of watchers) {
            if (!options.silent) {
              await dispatch(watcher)({ type: actionTypeEnd, ...event });
            }
          }
        }
      }
      if (this.db.isMockDb && options.silent) {
        this.db.mock.restoreEvents();
      }
    } catch (e) {
      // send failure event
      await this.dispatch(
        UnwatchedLocalEvent(this, {
          type: actionTypeFailure,
          ...event,
          transactionId,
          value: withoutMetaOrPrivate(this.data)
        })
      );

      throw new RecordCrudFailure(this, crudAction, transactionId, e);
    }
  }

  private _findDynamicComponents(path: string = "") {
    if (!path.includes(":")) {
      return [];
    }
    const results: string[] = [];
    let remaining = path;
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

  /**
   * looks for ":name" property references within the dbOffset or localPrefix and expands them
   */
  private _injectDynamicPathProperties(
    path: string,
    forProp: "dbOffset" | "localPath" = "dbOffset"
  ) {
    this.dynamicPathComponents.forEach(prop => {
      const value = this.data[prop as keyof T];

      if (value ? false : true) {
        throw createError(
          "record/not-ready",
          `You can not ask for the ${forProp} on a model like "${this.modelName}" which has a dynamic property of "${prop}" before setting that property [ id: ${this.id} ].`
        );
      }
      if (!["string", "number"].includes(typeof value)) {
        throw createError(
          "record/not-allowed",
          `The path is using the property "${prop}" on ${
            this.modelName
          } as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`
        );
      }
      path = path.replace(`:${prop}`, String(this.get(prop as keyof T)));
    });

    return path;
  }

  /**
   * Load data from a record in database; works with `get` static initializer
   */
  private async _getFromDB(id: string | ICompositeKey<T>) {
    const keys =
      typeof id === "string"
        ? createCompositeKeyFromFkString(id, this.modelConstructor)
        : id;

    // load composite key into props so the dbPath() will evaluate
    Object.keys(keys).map(key => {
      // TODO: fix up typing
      this._data[key as keyof T] = (keys as any)[key];
    });

    const data = await this.db.getRecord<T>(this.dbPath);

    if (data && data.id) {
      await this._initialize(data);
    } else {
      throw new FireModelError(
        `Failed to load the Record "${this.modelName}::${
          this.id
        }" with composite key of:\n ${JSON.stringify(keys, null, 2)}`,
        "firebase/invalid-composite-key"
      );
    }

    return this;
  }

  /**
   * Allows for the static "add" method to add a record
   */
  private async _adding(options: IRecordOptions) {
    if (!this.id) {
      this.id = fbKey();
    }
    const now = new Date().getTime();
    if (!this.get("createdAt")) {
      this._data.createdAt = now;
    }
    this._data.lastUpdated = now;
    if (!this.db) {
      throw new FireModelError(
        `Attempt to save Record failed as the Database has not been connected yet. Try setting FireModel's defaultDb first.`,
        "firemodel/db-not-ready"
      );
    }

    await this._localCrudOperation(IFmCrudOperations.add, undefined, options);

    return this;
  }

  //#endregion
}
