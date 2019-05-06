"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelMeta_1 = require("./ModelMeta");
// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = (context) => "";
class FireModel {
    static get defaultDb() {
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
    static set defaultDb(db) {
        this._defaultDb = db;
    }
    /**
     * All Watchers and write-based transactions in FireModel offer a way to
     * call out to a "dispatch" function. This can be done on a per-transaction
     * basis but more typically it makes sense to just set this once here and then
     * all subsequent transactions will use this dispatch function unless they are
     * explicitly passed another.
     */
    static set dispatch(fn) {
        if (!fn) {
            FireModel._dispatchActive = false;
            FireModel._dispatch = defaultDispatch;
        }
        else {
            FireModel._dispatchActive = true;
            FireModel._dispatch = fn;
        }
    }
    /**
     * The default dispatch function which should be called/notified whenever
     * a write based transaction has modified state.
     */
    static get dispatch() {
        return FireModel._dispatch;
    }
    //#endregion
    //#region PUBLIC INTERFACE
    /**
     * The name of the model; typically a "sigular" name
     */
    get modelName() {
        const name = this._model.constructor.name;
        const pascal = name.slice(0, 1).toLowerCase() + name.slice(1);
        return pascal;
    }
    /**
     * The plural name of the model (which plays a role in storage of state in both
     * the database as well as the dispatch function's path)
     */
    get pluralName() {
        const explicitPlural = this.META.plural;
        return explicitPlural || pluralize(this.modelName);
    }
    get dbPath() {
        return "dbPath was not overwritten!";
    }
    get localPath() {
        return "dbPath was not overwritten!";
    }
    get META() {
        return ModelMeta_1.getModelMeta(this._model);
    }
    /**
     * A list of all the properties -- and those properties
     * meta information -- contained on the given model
     */
    get properties() {
        const meta = ModelMeta_1.getModelMeta(this._model);
        return meta.properties;
    }
    /**
     * A list of all the realtionships -- and those relationships
     * meta information -- contained on the given model
     */
    get relationships() {
        const meta = ModelMeta_1.getModelMeta(this._model);
        return meta.relationships;
    }
    get dispatch() {
        return FireModel.dispatch;
    }
    static get isDefaultDispatch() {
        return FireModel.dispatch === defaultDispatch;
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
    //#region STATIC INTERFACE
    static isBeingWatched(path) {
        // TODO: implement this!
        return false;
    }
    //#endregion
    //#region PROTECTED INTERFACE
    /**
     * Creates a Redux-styled event
     */
    _createRecordEvent(record, type, pathsOrValue) {
        const payload = {
            type,
            modelName: record.modelName,
            modelConstructor: record._modelConstructor,
            dbPath: record.dbPath,
            compositeKey: record.compositeKey,
            localPath: record.localPath || record.modelName,
            key: record.id
        };
        if (Array.isArray(pathsOrValue)) {
            if (pathsOrValue.length === 1 && pathsOrValue[0].path === "/") {
                payload.value = pathsOrValue[0].value;
            }
            else {
                payload.paths = pathsOrValue;
                payload.localPath = record.localPath || record.modelName;
            }
        }
        else {
            payload.value = pathsOrValue;
        }
        return payload;
    }
    _getPaths(changes) {
        return Object.keys(changes).reduce((prev, current) => {
            const path = current;
            const value = changes[current];
            return [].concat(prev, [{ path, value }]);
        }, []);
    }
}
FireModel.auditLogs = "/auditing";
FireModel._dispatchActive = false;
/** the dispatch function used to interact with frontend frameworks */
FireModel._dispatch = defaultDispatch;
exports.FireModel = FireModel;
//# sourceMappingURL=FireModel.js.map