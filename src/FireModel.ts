export class FireModel<T> {
  protected static _defaultDb: import("abstracted-firebase").RealTimeDB = null;

  public static get defaultDb() {
    return FireModel._defaultDb;
  }

  public static set defaultDb(db: import("abstracted-firebase").RealTimeDB) {
    this._defaultDb = db;
  }

  // protected _model: T;
}
