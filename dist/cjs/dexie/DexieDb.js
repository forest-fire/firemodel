"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const errors_1 = require("../errors");
const dexie_1 = __importDefault(require("dexie"));
const DexieRecord_1 = require("./DexieRecord");
const DexieList_1 = require("./DexieList");
const util_1 = require("../util");
/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
class DexieDb {
    constructor(_name, ...models) {
        this._name = _name;
        /** simple dictionary of Dixie model defn's for indexation */
        this._models = {};
        this._constructors = {};
        /** META information for each of the `Model`'s */
        this._meta = {};
        /** maps `Model`'s singular name to a plural */
        this._singularToPlural = {};
        /** the current version number for the indexDB database */
        this._currentVersion = 1;
        this._priors = [];
        /** flag to indicate whether the Dexie DB has begun the initialization */
        this._isMapped = false;
        this._status = "initialized";
        this._models = DexieDb.modelConversion(...models);
        this._db = DexieDb._indexedDb
            ? new dexie_1.default(this._name, { indexedDB: DexieDb._indexedDb })
            : new dexie_1.default(this._name);
        this._db.on("blocked", () => {
            this._status = "blocked";
        });
        this._db.on("populate", () => {
            this._status = "populate";
        });
        this._db.on("ready", () => {
            this._status = "ready";
        });
        models.forEach(m => {
            const r = __1.Record.create(m);
            this._constructors[r.pluralName] = m;
            this._meta[r.pluralName] = Object.assign(Object.assign({}, r.META), { modelName: r.modelName, hasDynamicPath: r.hasDynamicPath, dynamicPathComponents: r.dynamicPathComponents, pluralName: r.pluralName });
            this._singularToPlural[r.modelName] = r.pluralName;
        });
    }
    //#region STATIC
    /**
     * Takes a _deconstructed_ array of **Firemodel** `Model` constructors and converts
     * them into a dictionary of Dexie-compatible model definitions where the _key_ to
     * the dictionary is the plural name of the model
     */
    static modelConversion(...modelConstructors) {
        if (modelConstructors.length === 0) {
            throw new errors_1.FireModelError(`A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`, "firemodel/no-models");
        }
        return modelConstructors.reduce((agg, curr) => {
            const dexieModel = [];
            const r = __1.Record.createWith(curr, new curr());
            const compoundIndex = r.hasDynamicPath
                ? ["id"].concat(r.dynamicPathComponents)
                : "";
            if (compoundIndex) {
                dexieModel.push(`[${compoundIndex.join("+")}]`);
            }
            // UNIQUE Indexes
            (r.hasDynamicPath ? [] : ["id"])
                .concat((r.META.dbIndexes || [])
                .filter(i => i.isUniqueIndex)
                .map(i => i.property))
                .forEach(i => dexieModel.push(`&${i}`));
            // NON-UNIQUE Indexes
            const indexes = []
                .concat((r.META.dbIndexes || [])
                .filter(i => i.isIndex && !i.isUniqueIndex)
                .map(i => i.property))
                // include dynamic props (if they're not explicitly marked as indexes)
                .concat(r.hasDynamicPath
                ? r.dynamicPathComponents.filter(i => !r.META.dbIndexes.map(idx => idx.property).includes(i))
                : [])
                .forEach(i => dexieModel.push(i));
            // MULTI-LEVEL Indexes
            const multiEntryIndex = []
                .concat(r.META.dbIndexes
                .filter(i => i.isMultiEntryIndex)
                .map(i => i.property))
                .forEach(i => dexieModel.push(`*${i}`));
            agg[r.pluralName] = dexieModel.join(",").trim();
            return agg;
        }, {});
    }
    /**
     * For _testing_ (or other edge cases where there is no global IDB) you may
     * pass in your own IndexDB API.
     *
     * This allows leveraging libraries such as:
     * - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)
     */
    static indexedDB(indexedDB, idbKeyRange) {
        // Dexie.dependencies.indexedDB = indexedDB;
        DexieDb._indexedDb = indexedDB;
        if (idbKeyRange) {
            dexie_1.default.dependencies.IDBKeyRange = idbKeyRange;
        }
    }
    //#endregion STATIC
    /**
     * read access to the **Dexie** model definitions
     */
    get models() {
        return this._models;
    }
    /**
     * read access to the **IndexDB**'s _name_
     */
    get dbName() {
        return this._name;
    }
    get version() {
        return this._currentVersion;
    }
    /**
     * The models which are known to this `DexieModel` instance.
     * The names will be in the _singular_ vernacular.
     */
    get modelNames() {
        return Object.keys(this._singularToPlural);
    }
    /**
     * The models which are known to this `DexieModel` instance.
     * The names will be in the _plural_ vernacular.
     */
    get pluralNames() {
        return Object.keys(this._models);
    }
    get db() {
        return this._db;
    }
    get status() {
        return this._status;
    }
    get isMapped() {
        return this._isMapped;
    }
    /**
     * The tables (and schemas) which Dexie is currently managing
     * in IndexedDB.
     *
     * Note: this will throw a "not-ready" error
     * if Dexie has _not_ yet connected to the DB.
     */
    get dexieTables() {
        return this.db.tables.map(t => ({ name: t.name, schema: t.schema }));
    }
    /**
     * Allows the addition of prior versions of the database. This sits on top
     * of the Dexie abstraction so you get all the nice benefits of that API.
     *
     * Structurally this function conforms to the _fluent_ API style and returns
     * the `DexieDb` instance.
     *
     * Find out more from:
     * - [Dexie Docs](https://dexie.org/docs/Tutorial/Design#database-versioning)
     * - [Prior Version _typing_](https://github.com/forest-fire/firemodel/blob/master/src/%40types/dexie.ts)
     */
    addPriorVersion(version) {
        this._priors.push(version);
        this._currentVersion++;
        return this;
    }
    /**
     * Checks whether Dexie/IndexedDB is managing the state for a given
     * `Model`
     *
     * @param model the `Model` in question
     */
    modelIsManagedByDexie(model) {
        const r = __1.Record.create(model);
        return this.modelNames.includes(r.modelName);
    }
    /**
     * Returns a typed **Dexie** `Table` object for a given model class
     */
    table(model) {
        const r = __1.Record.create(model);
        if (!this.isOpen()) {
            this.open();
        }
        if (!this.modelIsManagedByDexie(model)) {
            throw new errors_1.DexieError(`Attempt to get a Dexie.Table for "${util_1.capitalize(r.modelName)}" Firemodel model but this model is not being managed by Dexie! Models being managed are: ${this.modelNames.join(", ")}`, "dexie/table-does-not-exist");
        }
        const table = this._db.table(r.pluralName);
        table.mapToClass(model);
        return table;
    }
    /**
     * Provides a **Firemodel**-_like_ API surface to interact with singular
     * records.
     *
     * @param model the **Firemodel** model (aka, the constructor)
     */
    record(model) {
        const r = __1.Record.create(model);
        if (!this.modelNames.includes(r.modelName)) {
            const isPlural = this.pluralNames.includes(r.modelName);
            throw new errors_1.DexieError(`Attempt to reach the record API via DexieDb.record("${model}") failed as there is no known Firemodel model of that name. ${isPlural
                ? "It looks like you may have accidentally used the plural name instead"
                : ""}. Known model types are: ${this.modelNames.join(", ")}`, "dexie/model-does-not-exist");
        }
        if (!this.isOpen()) {
            this.open();
        }
        return new DexieRecord_1.DexieRecord(model, this.table(model), this.meta(r.modelName));
    }
    /**
     * Provides a very **Firemodel**-_like_ API surface to interact with LIST based
     * queries.
     *
     * @param model the **Firemodel** `Model` name
     */
    list(model) {
        const r = __1.Record.create(model);
        if (!this.isOpen()) {
            this.open();
        }
        const table = r.hasDynamicPath
            ? this.table(model)
            : this.table(model);
        const meta = this.meta(r.modelName);
        return new DexieList_1.DexieList(model, table, meta);
    }
    /**
     * Returns the META for a given `Model` identified by
     * the model's _plural_ (checked first) or _singular_ name.
     */
    meta(name, _originated = "meta") {
        return this._checkPluralThenSingular(this._meta, name, _originated);
    }
    /**
     * Returns a constructor for a given **Firemodel** `Model`
     *
     * @param name either the _plural_ or _singular_ name of a model
     * managed by the `DexieModel` instance
     */
    modelConstructor(name) {
        return this._checkPluralThenSingular(this._constructors, name, "modelConstructor");
    }
    /**
     * Checks whether the connection to the **IndexDB** is open
     */
    isOpen() {
        return this._db.isOpen();
    }
    /**
     * Sets all the defined models (as well as priors) to the
     * Dexie DB instance.
     */
    mapModels() {
        this._mapVersionsToDexie();
        this._status = "mapped";
        this._isMapped = true;
    }
    /**
     * Opens the connection to the **IndexDB**.
     *
     * Note: _if the **Firemodel** models haven't yet been mapped to Dexie
     * then they will be prior to openning the connection._
     */
    async open() {
        if (this._db.isOpen()) {
            throw new errors_1.DexieError(`Attempt to call DexieDb.open() failed because the database is already open!`, `dexie/db-already-open`);
        }
        if (!this.isMapped) {
            this.mapModels();
        }
        return this._db.open();
    }
    /**
     * Closes the IndexDB connection
     */
    close() {
        if (!this._db.isOpen()) {
            throw new errors_1.DexieError(`Attempt to call DexieDb.close() failed because the database is NOT open!`, `dexie/db-not-open`);
        }
        this._db.close();
    }
    _checkPluralThenSingular(obj, name, fn) {
        if (obj[name]) {
            return obj[name];
        }
        else if (this._singularToPlural[name]) {
            return obj[this._singularToPlural[name]];
        }
        throw new errors_1.DexieError(`Failed while calling DexieModel.${fn}("${name}") because "${name}" is neither a singular or plural name of a known model!`, `firemodel/invalid-dexie-model`);
    }
    _mapVersionsToDexie() {
        this._priors.forEach((prior, idx) => {
            if (prior.upgrade) {
                this._db
                    .version(idx + 1)
                    .stores(prior.models)
                    .upgrade(prior.upgrade);
            }
            else {
                this._db.version(idx).stores(prior.models);
            }
        });
        this._db.version(this._currentVersion).stores(this.models);
        this._isMapped = true;
    }
}
exports.DexieDb = DexieDb;
//# sourceMappingURL=DexieDb.js.map