import { Model } from "./Model";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { ISchemaOptions } from "./index";
// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");

export class FireModel<T = Model> {
  //#region STATIC INTERFACE

  private static _defaultDb: import("abstracted-firebase").RealTimeDB = null;

  public static get defaultDb() {
    return FireModel._defaultDb;
  }

  public static set defaultDb(db: import("abstracted-firebase").RealTimeDB) {
    this._defaultDb = db;
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

  public get META(): ISchemaOptions {
    return (this._model as Model).META;
  }

  public get properties() {
    return (this._model as Model).META.properties;
  }

  public get relationships() {
    return (this._model as Model).META.relationships;
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

  //#endregion
}
