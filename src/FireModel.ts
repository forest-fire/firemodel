import { Model } from "./Model";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { IModelMetaProperties } from "./index";
// prettier-ignore
type Record<T> = import("./Record").Record<T>;
import { IDictionary } from "common-types";
import {
  IFMRecordEvent,
  FMEvents,
  NotString,
  Extractable,
  IFMRelationshipEvent,
  IFMEventName
} from "./state-mgmt";
import { IReduxDispatch } from "./VuexWrapper";
import { getModelMeta } from "./ModelMeta";
// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = (context: IDictionary) => "";

export class FireModel<T extends Model> {
  //#region STATIC INTERFACE
  public static auditLogs: string = "/auditing";

  public static isBeingWatched(path: string): boolean {
    // TODO: implement this!
    return false;
  }
  private static _defaultDb: RealTimeDB = null;
  private static _dispatchActive: boolean = false;
  /** the dispatch function used to interact with frontend frameworks */
  private static _dispatch: IReduxDispatch = defaultDispatch;

  public static get defaultDb() {
    return FireModel._defaultDb;
  }

  public static set defaultDb(db: RealTimeDB) {
    this._defaultDb = db;
  }

  public static set dispatch(fn: IReduxDispatch) {
    if (!fn) {
      FireModel._dispatchActive = false;
      FireModel._dispatch = defaultDispatch;
    } else {
      FireModel._dispatchActive = true;
      FireModel._dispatch = fn;
    }
  }

  public static get dispatch() {
    return FireModel._dispatch;
  }

  //#endregion

  //#region OBJECT INTERFACE

  /** the data structure/model that this class operates around */
  protected _model: T;
  protected _modelConstructor: new () => T;
  protected _db: RealTimeDB;

  //#endregion

  //#region PUBLIC INTERFACE

  public get modelName() {
    return this._model.constructor.name.toLowerCase();
  }

  public get pluralName() {
    // TODO: add back the exception processing
    return pluralize(this.modelName);
  }

  public get dbPath() {
    return "dbPath was not overwritten!";
  }

  public get localPath() {
    return "dbPath was not overwritten!";
  }

  public get META(): IModelMetaProperties<T> {
    const coreMeta = (this._model as Model).META;
    const storedMeta = getModelMeta(this.modelName);

    return { ...storedMeta, ...coreMeta };
  }

  public get properties() {
    return (this._model as Model).META.properties;
  }

  public get relationships() {
    return (this._model as Model).META.relationships;
  }

  public get dispatch() {
    return FireModel.dispatch;
  }

  public get dispatchIsActive(): boolean {
    return FireModel._dispatchActive;
  }

  /** the connected real-time database */
  public get db() {
    if (!this._db) {
      this._db = FireModel.defaultDb;
    }
    if (!this._db) {
      const e = new Error(
        `Can't get DB as it has not been set yet for this instance and no default database exists [ ${
          this.modelName
        } ]!`
      );
      e.name = "FireModel::NoDatabase";
      throw e;
    }

    return this._db;
  }

  public get pushKeys() {
    return (this._model as Model).META.pushKeys;
  }

  //#endregion

  //#region PROTECTED INTERFACE

  /**
   * Creates a Redux-styled event
   */
  protected _createRecordEvent<
    K extends string & NotString<K> & Extractable<FMEvents, K>
  >(record: Record<T>, type: K, pathsOrValue: IMultiPathUpdates[] | T) {
    const payload: Partial<IFMRecordEvent<T>> = {
      type,
      model: record.modelName,
      modelConstructor: record._modelConstructor,
      dbPath: record.dbPath,
      localPath: record.localPath,
      key: record.id
    };
    if (Array.isArray(pathsOrValue)) {
      payload.paths = pathsOrValue;
    } else {
      payload.value = pathsOrValue;
    }

    return payload as IFMRecordEvent<T>;
  }

  protected _getPaths(changes: IDictionary): IMultiPathUpdates[] {
    return Object.keys(changes).reduce(
      (prev: any[], current: Extract<keyof typeof changes, string>) => {
        const path = current;
        const value = changes[current];
        return [].concat(prev, [{ path, value }]);
      },
      []
    );
  }

  //#endregion
}

export interface IMultiPathUpdates {
  path: string;
  value: any;
}
