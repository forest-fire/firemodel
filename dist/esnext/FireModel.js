// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
export class FireModel {
    //#region STATIC INTERFACE
    static isBeingWatched(path) {
        // TODO: implement this!
        return false;
    }
    static get defaultDb() {
        return FireModel._defaultDb;
    }
    static set defaultDb(db) {
        this._defaultDb = db;
    }
    static set dispatch(fn) {
        FireModel._dispatchActive = true;
        FireModel._dispatch = fn;
    }
    static get dispatch() {
        return FireModel._dispatch;
    }
    //#endregion
    //#region PUBLIC INTERFACE
    get modelName() {
        return this._model.constructor.name.toLowerCase();
    }
    get pluralName() {
        // TODO: add back the exception processing
        return pluralize(this.modelName);
    }
    get dbPath() {
        return "dbPath was not overwritten!";
    }
    get localPath() {
        return "dbPath was not overwritten!";
    }
    get META() {
        return this._model.META;
    }
    get properties() {
        return this._model.META.properties;
    }
    get relationships() {
        return this._model.META.relationships;
    }
    get dispatch() {
        return FireModel.dispatch;
    }
    get dispatchIsActive() {
        return FireModel._dispatchActive;
    }
    /** the connected real-time database */
    get db() {
        if (!this._db) {
            this._db = FireModel.defaultDb;
        }
        if (!this._db) {
            const e = new Error(`Can't get DB as it has not been set yet for this instance and no default database exists [ ${this.modelName} ]!`);
            e.name = "FireModel::NoDatabase";
            throw e;
        }
        return this._db;
    }
    get pushKeys() {
        return this._model.META.pushKeys;
    }
    //#endregion
    //#region PROTECTED INTERFACE
    /**
     * Creates a Redux-styled event
     */
    _createRecordEvent(record, type, paths) {
        const inProcess = paths.find(i => i.path === "META/inProcess");
        const payload = {
            type,
            source: inProcess === true
                ? "client"
                : inProcess === false
                    ? "client-response"
                    : "unspecified",
            model: record.modelName,
            modelConstructor: record._modelConstructor,
            dbPath: record.dbPath,
            localPath: record.localPath,
            key: record.id
        };
        if (paths) {
            payload.paths = paths;
        }
        return payload;
    }
    _getPaths(changes) {
        return Object.keys(changes).reduce((prev, next) => {
            return prev.concat(...prev, ...[
                {
                    [next]: changes[next]
                }
            ]);
        }, []);
    }
}
FireModel._defaultDb = null;
FireModel._dispatchActive = false;
//# sourceMappingURL=FireModel.js.map