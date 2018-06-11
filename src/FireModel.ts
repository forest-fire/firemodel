export class FireModel<T> {
  // STATIC INTERFACE

  private static _defaultDb: import("abstracted-firebase").RealTimeDB = null;

  public static get defaultDb() {
    return FireModel._defaultDb;
  }

  public static set defaultDb(db: import("abstracted-firebase").RealTimeDB) {
    this._defaultDb = db;
  }
  // OBJECT INTERFACE

  /** the data structure/model that this class operates around */
  protected _model: T;
}
