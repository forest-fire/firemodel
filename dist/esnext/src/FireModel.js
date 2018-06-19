import { Record } from "./Record";
// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = (context) => "";
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
        if (!fn) {
            FireModel._dispatchActive = false;
            FireModel._dispatch = defaultDispatch;
        }
        else {
            FireModel._dispatchActive = true;
            FireModel._dispatch = fn;
        }
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
    _createRecordEvent(record, type, pathsOrValue) {
        const payload = {
            type,
            model: record.modelName,
            modelConstructor: record._modelConstructor,
            dbPath: record.dbPath,
            localPath: record.localPath,
            key: record.id
        };
        if (Array.isArray(pathsOrValue)) {
            payload.paths = pathsOrValue;
        }
        else {
            payload.value = pathsOrValue;
        }
        return payload;
    }
    _createRelationshipEvent(record, type, relProp, fk, paths) {
        const fkConstruct = record.META.property(relProp).fkConstructor;
        const hasInverse = record.META.property(relProp).inverse;
        const fkRecord = Record.create(fkConstruct);
        const payload = {
            type,
            model: record.modelName,
            modelConstructor: record._modelConstructor,
            dbPath: record.dbPath,
            localPath: record.localPath,
            key: record.id,
            paths,
            fk,
            fkModelName: fkRecord.modelName,
            fkHasInverse: hasInverse
        };
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
FireModel._defaultDb = null;
FireModel._dispatchActive = false;
/** the dispatch function used to interact with frontend frameworks */
FireModel._dispatch = defaultDispatch;
//# sourceMappingURL=FireModel.js.map