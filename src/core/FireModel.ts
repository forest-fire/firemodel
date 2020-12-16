import {
  IAbstractedDatabase,
  IAdminConfig,
  IClientConfig,
} from "universal-fire";
import { IDictionary } from "common-types";
import {
  IFmChangedProperties,
  IFmModelMeta,
  IFmModelPropertyMeta,
  IFmModelRelationshipMeta,
  IReduxDispatch,
  IModel,
} from "@/types";

import {
  getModelMeta,
  modelRegister,
  listRegisteredModels,
  modelRegistryLookup,
} from "@/util";

import type { Record } from "@/core";

// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch: IReduxDispatch<any, any> = async (context) => "";

const registeredModules: IDictionary<new () => any> = {};

export class FireModel<T extends IModel> {
  public static get defaultDb() {
    return FireModel._defaultDb;
  }

  /**
   * Any FireModel transaction needs to connect to the database
   * via a passed-in reference to "abstracted-client" or "abstracted-admin"
   * database. These references can be done with any/every transaction via
   * the options hash but it is often more convient to set a "fallback" or
   * "default" database to use should a given transaction not state a DB
   * connection explicitly.
   */
  public static set defaultDb(db: IAbstractedDatabase) {
    this._defaultDb = db;
  }

  /**
   * All Watchers and write-based transactions in FireModel offer a way to
   * call out to a "dispatch" function. This can be done on a per-transaction
   * basis but more typically it makes sense to just set this once here and then
   * all subsequent transactions will use this dispatch function unless they are
   * explicitly passed another.
   */
  public static set dispatch(fn: IReduxDispatch) {
    if (!fn) {
      FireModel._dispatchActive = false;
      FireModel._dispatch = defaultDispatch;
    } else {
      FireModel._dispatchActive = true;
      FireModel._dispatch = fn;
    }
  }

  /**
   * The default dispatch function which should be called/notified whenever
   * a write based transaction has modified state.
   */
  public static get dispatch() {
    return FireModel._dispatch;
  }

  //#endregion

  //#region PUBLIC INTERFACE

  /**
   * The name of the model; typically a "sigular" name
   */
  public get modelName() {
    const name = this._model.constructor.name;
    const pascal = name.slice(0, 1).toLowerCase() + name.slice(1);

    return pascal;
  }

  /**
   * The plural name of the model (which plays a role in storage of state in both
   * the database as well as the dispatch function's path)
   */
  public get pluralName() {
    const explicitPlural = this.META.plural;
    return explicitPlural || pluralize(this.modelName);
  }

  public get dbPath() {
    return "dbPath was not overwritten!";
  }

  public get localPath() {
    return "dbPath was not overwritten!";
  }

  public get META(): IFmModelMeta<T> {
    return getModelMeta(this._model);
  }

  /**
   * A list of all the properties -- and those properties
   * meta information -- contained on the given model
   */
  public get properties(): IFmModelPropertyMeta[] {
    const meta = getModelMeta(this._model);
    return meta.properties;
  }

  /**
   * A list of all the realtionships -- and those relationships
   * meta information -- contained on the given model
   */
  public get relationships(): IFmModelRelationshipMeta[] {
    const meta = getModelMeta(this._model);
    return meta.relationships;
  }

  public get dispatch() {
    return FireModel.dispatch;
  }

  public static get isDefaultDispatch() {
    return FireModel.dispatch === defaultDispatch;
  }

  public get dispatchIsActive(): boolean {
    return FireModel._dispatchActive;
  }

  /** the connected real-time database */
  public get db(): IAbstractedDatabase {
    if (!this._db) {
      this._db = FireModel.defaultDb;
    }
    if (!this._db) {
      const e = new Error(
        `Can't get DB as it has not been set yet for this instance and no default database exists [ ${this.modelName} ]!`
      );
      e.name = "FireModel::NoDatabase";
      throw e;
    }

    return this._db;
  }

  public get pushKeys() {
    return (this._model as IModel).META.pushKeys;
  }

  public static auditLogs: string = "/auditing";

  /**
   * **connect**
   *
   * This static initializer facilitates connecting **FireModel** with
   * the firebase database in a compact and convenient way:
```typescript
import { DB } from 'abstracted-xxx';
const db = await FireModel.connect(DB, options);
```
   * This method not only sets **FireModel**'s `defaultDb` property but
   * also returns a reference to the `abstracted-client`/`abstracted-admin`
   * object so you can use this externally to FireModel should you choose to.
   *
   * Note: each _CRUD_ action in FireModel allows passing
   * in a DB connection (which opens up the possibility of multiple firebase
   * databases) but the vast majority of projects only have ONE firebase
   * database so this just makes the whole process much easier.
   */
  public static async connect<T extends IAbstractedDatabase>(
    RTDB: {
      connect: (options: Partial<IAdminConfig> & IClientConfig) => T;
    },
    options: Partial<IAdminConfig> & IClientConfig
  ) {
    const db = await RTDB.connect(options);
    FireModel.defaultDb = db;
    return db;
  }

  public static register<T extends IModel = IModel>(model: new () => T) {
    modelRegister(model);
  }

  public static listRegisteredModels() {
    return listRegisteredModels();
  }

  public static lookupModel(name: string) {
    return modelRegistryLookup(name);
  }

  //#region STATIC INTERFACE

  public static isBeingWatched(path: string): boolean {
    // TODO: implement this!
    return false;
  }
  private static _defaultDb: IAbstractedDatabase;
  private static _dispatchActive: boolean = false;
  /** the dispatch function used to interact with frontend frameworks */
  private static _dispatch: IReduxDispatch = defaultDispatch;

  //#endregion

  //#region OBJECT INTERFACE

  /** the data structure/model that this class operates around */
  protected _model: T;
  protected _modelConstructor: new () => T;
  protected _db: IAbstractedDatabase;

  //#endregion

  //#region PROTECTED INTERFACE

  protected _getPaths(
    rec: Record<T>,
    deltas: IFmChangedProperties<T>
  ): IDictionary {
    const added = (deltas.added || []).reduce((agg: IDictionary, curr) => {
      agg[`${this.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = rec.get(curr);
      return agg;
    }, {});
    const removed = (deltas.removed || []).reduce((agg: IDictionary, curr) => {
      agg[`${this.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = null;
      return agg;
    }, {});
    const updated = (deltas.changed || []).reduce((agg: IDictionary, curr) => {
      agg[`${this.dbPath}/${curr}`.replace(/\/{2,3}/, '/')] = rec.get(curr);
      return agg;
    }, {});

    return { ...added, ...removed, ...updated };
  }

  //#endregion
}
