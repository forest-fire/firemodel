import { pathJoin } from "common-types";
import { getModelMeta } from "./ModelMeta";
import { modelRegister, listRegisteredModels, modelRegistryLookup } from "./record/relationships/modelRegistration";
// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = async (context) => "";
const registeredModules = {};
let FireModel = /** @class */ (() => {
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
            return getModelMeta(this._model);
        }
        /**
         * A list of all the properties -- and those properties
         * meta information -- contained on the given model
         */
        get properties() {
            const meta = getModelMeta(this._model);
            return meta.properties;
        }
        /**
         * A list of all the realtionships -- and those relationships
         * meta information -- contained on the given model
         */
        get relationships() {
            const meta = getModelMeta(this._model);
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
        static async connect(RTDB, options) {
            const db = await RTDB.connect(options);
            FireModel.defaultDb = db;
            return db;
        }
        static register(model) {
            modelRegister(model);
        }
        static listRegisteredModels() {
            return listRegisteredModels();
        }
        static lookupModel(name) {
            return modelRegistryLookup(name);
        }
        //#region STATIC INTERFACE
        static isBeingWatched(path) {
            // TODO: implement this!
            return false;
        }
        //#endregion
        //#region PROTECTED INTERFACE
        _getPaths(rec, deltas) {
            const added = (deltas.added || []).reduce((agg, curr) => {
                agg[pathJoin(this.dbPath, curr)] = rec.get(curr);
                return agg;
            }, {});
            const removed = (deltas.removed || []).reduce((agg, curr) => {
                agg[pathJoin(this.dbPath, curr)] = null;
                return agg;
            }, {});
            const updated = (deltas.changed || []).reduce((agg, curr) => {
                agg[pathJoin(this.dbPath, curr)] = rec.get(curr);
                return agg;
            }, {});
            return Object.assign(Object.assign(Object.assign({}, added), removed), updated);
        }
    }
    FireModel.auditLogs = "/auditing";
    FireModel._dispatchActive = false;
    /** the dispatch function used to interact with frontend frameworks */
    FireModel._dispatch = defaultDispatch;
    return FireModel;
})();
export { FireModel };
//# sourceMappingURL=FireModel.js.map