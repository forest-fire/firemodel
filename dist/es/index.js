import { SerializedQuery } from '@forest-fire/base-serializer';
import { Parallel } from 'wait-in-parallel';
import { pathJoin as pathJoin$1, dotNotation as dotNotation$1, wait } from 'common-types';
import { arrayToHash, hashToArray } from 'typed-conversions';
import copy from 'fast-copy';
import { key } from 'firebase-key';
import equal from 'fast-deep-equal';
import Dexie from 'dexie';
import { format } from 'date-fns';
import { Mock as Mock$1, getMockHelper } from 'firemock';
import 'reflect-metadata';
import get from 'get-value';
import set from 'set-value';
import { SerializedQuery as SerializedQuery$1 } from 'universal-fire';

/**
 * writeAudit
 *
 * Allows for a consistent way of writing audit records to the database
 *
 * @param recordId the ID of the record which is changing
 * @param pluralName the plural name of the Model type
 * @param action CRUD action
 * @param changes array of changes
 * @param options
 */
async function writeAudit(record, action, changes, options = {}) {
    const db = options.db || FireModel.defaultDb;
    await Record.add(AuditLog, {
        modelName: capitalize(record.modelName),
        modelId: record.id,
        action,
        changes,
    }, { db });
}

class AuditBase {
    constructor(modelKlass, options = {}) {
        this._modelKlass = modelKlass;
        this._record = Record.create(modelKlass);
        this._db = options.db || FireModel.defaultDb;
    }
    get db() {
        return this._db;
    }
    get dbPath() {
        return pathJoin(FireModel.auditLogs, this._record.pluralName);
    }
}

class AuditList extends AuditBase {
    constructor(modelKlass, options = {}) {
        super(modelKlass, options);
        this._query = SerializedQuery.create(this.db, pathJoin(this.dbPath, "all"));
    }
    async first(howMany, offset = 0) {
        this._query = this._query.limitToFirst(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async last(howMany, offset = 0) {
        this._query = this._query.limitToLast(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async since(when) {
        this._query = this._query.orderByChild("createdAt").startAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async before(when) {
        this._query = this._query.orderByChild("createdAt").endAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async between(from, to) {
        this._query = this._query.orderByChild("createdAt").startAt(from).endAt(to);
        const log = await this.db.getList(this._query);
        return log || [];
    }
}

class AuditRecord extends AuditBase {
    constructor(modelKlass, id, options = {}) {
        super(modelKlass, options);
        this._recordId = id;
        this._query = SerializedQuery.create(this.db);
    }
    /**
     * Queries the database for the first _x_ audit records [`howMany`] of
     * a given Record type. You can also optionally specify an offset to
     * start at [`startAt`].
     */
    async first(howMany, startAt) {
        this._query = this._query.setPath(this.byId);
        this._query = this._query.orderByKey().limitToLast(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        const ids = (await this.db.getList(this._query)).map((i) => pathJoin(this.auditLogs, i.id));
        const p = new Parallel();
        ids.map((id) => p.add(id, this.db.getValue(id)));
        const results = await p.isDoneAsArray();
        return results;
    }
    async last(howMany, startAt) {
        this._query = this._query
            .setPath(this.byId)
            .orderByKey()
            .limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        const ids = (await this.db.getList(this._query)).map((i) => pathJoin(this.auditLogs, i.id));
        const p = new Parallel();
        ids.map((id) => p.add(id, this.db.getValue(id)));
        const results = await p.isDoneAsArray();
        return results;
    }
    async since(when) {
        if (typeof when === "string") {
            when = new Date(when).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .startAt(when);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map((i) => pathJoin(this.auditLogs, i.id));
        const p = new Parallel();
        ids.map((id) => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    async before(when) {
        if (typeof when === "string") {
            when = new Date(when).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .endAt(when);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map((i) => pathJoin(this.auditLogs, i.id));
        const p = new Parallel();
        ids.map((id) => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    async between(after, before) {
        if (typeof after === "string") {
            after = new Date(after).getTime();
        }
        if (typeof before === "string") {
            before = new Date(before).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .startAt(after)
            .endAt(before);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map((i) => pathJoin(this.auditLogs, i.id));
        const p = new Parallel();
        ids.map((id) => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    get auditLogs() {
        return pathJoin(this.dbPath, "all");
    }
    get byId() {
        return pathJoin(this.dbPath, "byId", this._recordId, "all");
    }
    byProp(prop) {
        return pathJoin(this.dbPath, "byId", this._recordId, "props", prop);
    }
}

// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = async (context) => "";
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
                agg[pathJoin$1(this.dbPath, curr)] = rec.get(curr);
                return agg;
            }, {});
            const removed = (deltas.removed || []).reduce((agg, curr) => {
                agg[pathJoin$1(this.dbPath, curr)] = null;
                return agg;
            }, {});
            const updated = (deltas.changed || []).reduce((agg, curr) => {
                agg[pathJoin$1(this.dbPath, curr)] = rec.get(curr);
                return agg;
            }, {});
            return { ...added, ...removed, ...updated };
        }
    }
    FireModel.auditLogs = "/auditing";
    FireModel._dispatchActive = false;
    /** the dispatch function used to interact with frontend frameworks */
    FireModel._dispatch = defaultDispatch;
    return FireModel;
})();

/**
 * Provides a _Model_ aware means of mocking your data.
 *
 * @param modelConstructor The Model being mocked
 * @param db optionally state the DB connection; will use **Firemodel**'s default DB otherwise
 */
function Mock(modelConstructor, db) {
    if (!db) {
        if (FireModel.defaultDb) {
            db = FireModel.defaultDb;
        }
        else {
            throw new FireModelError(`You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`, "mock/no-database");
        }
    }
    if (!db.isMockDb) {
        console.warn("You are using Mock() with a real database; typically a mock database is preferred");
    }
    return FiremodelMockApi(db, modelConstructor);
}

const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
function addTimestamps(obj) {
    const datetime = new Date().getTime();
    const output = {};
    Object.keys(obj).forEach((i) => {
        output[i] = {
            ...obj[i],
            createdAt: datetime,
            lastUpdated: datetime,
        };
    });
    return output;
}
class List extends FireModel {
    constructor(model, options = {}) {
        super();
        //#endregion
        this._data = [];
        this._modelConstructor = model;
        this._model = new model();
        if (options.db) {
            this._db = options.db;
            if (!FireModel.defaultDb) {
                FireModel.defaultDb = options.db;
            }
        }
        if (options.offsets) {
            this._offsets = options.offsets;
        }
    }
    //#region STATIC Interfaces
    /**
     * Sets the default database to be used by all FireModel classes
     * unless explicitly told otherwise
     */
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    static get defaultDb() {
        return FireModel.defaultDb;
    }
    /**
     * Set
     *
     * Sets a given model to the payload passed in. This is
     * a destructive operation ... any other records of the
     * same type that existed beforehand are removed.
     */
    static async set(model, payload, options = {}) {
        try {
            const m = Record.create(model, options);
            // If Auditing is one we must be more careful
            if (m.META.audit) {
                const existing = await List.all(model, options);
                if (existing.length > 0) {
                    // TODO: need to write an appropriate AUDIT EVENT
                    // TODO: implement
                }
                else {
                    // LIST_SET event
                    // TODO: need to write an appropriate AUDIT EVENT
                    // TODO: implement
                }
            }
            else {
                // Without auditing we can just set the payload into the DB
                const datetime = new Date().getTime();
                await FireModel.defaultDb.set(`${m.META.dbOffset}/${m.pluralName}`, addTimestamps(payload));
            }
            const current = await List.all(model, options);
            return current;
        }
        catch (e) {
            const err = new Error(`Problem adding new Record: ${e.message}`);
            err.name = e.name !== "Error" ? e.name : "FireModel";
            throw e;
        }
    }
    static set dispatch(fn) {
        FireModel.dispatch = fn;
    }
    static create(model, options) {
        return new List(model, options);
    }
    /**
     * Creates a List<T> which is populated with the passed in query
     *
     * @param schema the schema type
     * @param query the serialized query; note that this LIST will override the path of the query
     * @param options model options
     */
    static async fromQuery(model, query, options = {}) {
        const list = List.create(model, options);
        const path = options && options.offsets
            ? List.dbPath(model, options.offsets)
            : List.dbPath(model);
        query.setPath(path);
        await list.load(query);
        return list;
    }
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */
    static async all(model, options = {}) {
        const query = SerializedQuery.create(this.defaultDb).orderByChild("lastUpdated");
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * Loads the first X records of the Schema type where
     * ordering is provided by the "createdAt" property
     *
     * @param model the model type
     * @param howMany the number of records to bring back
     * @param options model options
     */
    static async first(model, howMany, options = {}) {
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild("createdAt")
            .limitToLast(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * recent
     *
     * Get recent items of a given type/schema (based on lastUpdated)
     *
     * @param model the TYPE you are interested
     * @param howMany the quantity to of records to bring back
     * @param offset start at an offset position (useful for paging)
     * @param options
     */
    static async recent(model, howMany, offset = 0, options = {}) {
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild("lastUpdated")
            .limitToFirst(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * **since**
     *
     * Brings back all records that have changed since a given date (using `lastUpdated` field)
     */
    static async since(model, since, options = {}) {
        if (typeof since !== "number") {
            const e = new Error(`Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`);
            e.name = "NotAllowed";
            throw e;
        }
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild("lastUpdated")
            .startAt(since);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * **List.inactive()**
     *
     * provides a way to sort out the "x" _least active_ records where
     * "least active" means that their `lastUpdated` property has gone
     * without any update for the longest.
     */
    static async inactive(model, howMany, options = {}) {
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild("lastUpdated")
            .limitToLast(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * **List.last()**
     *
     * Lists the _last "x"_ items of a given model where "last" refers to the datetime
     * that the record was **created**.
     */
    static async last(model, howMany, options = {}) {
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild("createdAt")
            .limitToFirst(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * **List.find()**
     *
     * Runs a `List.where()` search and returns the first result as a _model_
     * of type `T`. If no results were found it returns `undefined`.
     */
    static async find(model, property, value, options = {}) {
        const results = await List.where(model, property, value, options);
        return results.length > 0 ? results.data[0] : undefined;
    }
    /**
     * Puts an array of records into Firemodel as one operation; this operation
     * is only available to those who are using the Admin SDK/API.
     */
    static async bulkPut(model, records, options = {}) {
        if (!FireModel.defaultDb.isAdminApi) {
            throw new FireModelError(`You must use the Admin SDK/API to use the bulkPut feature. This may change in the future but in part because the dispatch functionality is not yet set it is restricted to the Admin API for now.`);
        }
        if (Array.isArray(records)) {
            records = arrayToHash(records);
        }
        const dbPath = List.dbPath(model, options.offsets);
        await FireModel.defaultDb.update(dbPath, records);
    }
    /**
     * **List.where()**
     *
     * A static inializer which give you a list of all records of a given model
     * which meet a given logical condition. This condition is executed on the
     * **Firebase** side and a `List` -- even if no results met the criteria --
     * is returned.
     *
     * **Note:** the default comparison operator is **equals** but you can
     * override this default by adding a _tuple_ to the `value` where the first
     * array item is the operator, the second the value you are comparing against.
     */
    static async where(model, property, value, options = {}) {
        let operation = "=";
        let val = value;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        const query = SerializedQuery.create(this.defaultDb)
            .orderByChild(property)
            // @ts-ignore
            // Not sure why there is a typing issue here.
            .where(operation, val);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    // TODO: add unit tests!
    /**
     * Get's a _list_ of records. The return object is a `List` but the way it is composed
     * doesn't actually do a query against the database but instead it just takes the array of
     * `id`'s passed in,
     *
     * **Note:** the term `ids` is not entirely accurate, it should probably be phrased as `fks`
     * because the "id" can be any form of `ICompositeKey` as well just a plain `id`. The naming
     * here is just to retain consistency with the **Watch** api.
     */
    static async ids(model, ...fks) {
        const promises = [];
        const results = [];
        fks.forEach((fk) => {
            promises.push(Record.get(model, fk).then((p) => results.push(p.data)));
        });
        await Promise.all(promises);
        const obj = new List(model);
        obj._data = results;
        return obj;
    }
    /**
     * If you want to just get the `dbPath` of a Model you can call
     * this static method and the path will be returned.
     *
     * **Note:** the optional second parameter lets you pass in any
     * dynamic path segments if that is needed for the given model.
     */
    static dbPath(model, offsets) {
        const obj = offsets ? List.create(model, { offsets }) : List.create(model);
        return obj.dbPath;
    }
    get length() {
        return this._data.length;
    }
    get dbPath() {
        const dbOffset = getModelMeta(this._model).dbOffset;
        return [this._injectDynamicDbOffsets(dbOffset), this.pluralName].join("/");
    }
    /**
     * Gives the path in the client state tree to the beginning
     * where this LIST will reside.
     *
     * Includes `localPrefix` and `pluralName`, but does not include `localPostfix`
     */
    get localPath() {
        const meta = this._model.META || getModelMeta(this._model);
        return pathJoin(meta.localPrefix, meta.localModelName !== this.modelName
            ? meta.localModelName
            : this.pluralName);
    }
    /**
     * Used with local state management tools, it provides a postfix to the state tree path
     * The default is `all` and it will probably be used in most cases
     *
     * e.g. If the model is called `Tree` then your records will be stored at `trees/all`
     * (assuming the default `all` postfix)
     */
    get localPostfix() {
        const meta = this._model.META || getModelMeta(this._model);
        return meta.localPostfix;
    }
    /** Returns another List with data filtered down by passed in filter function */
    filter(f) {
        const list = List.create(this._modelConstructor);
        list._data = this._data.filter(f);
        return list;
    }
    /** Returns another List with data filtered down by passed in filter function */
    find(f, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const filtered = this._data.filter(f);
        const r = Record.create(this._modelConstructor);
        if (filtered.length > 0) {
            return Record.createWith(this._modelConstructor, filtered[0]);
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const e = new Error(`find(fn) did not find a value in the List [ length: ${this.data.length} ]`);
                e.name = "NotFound";
                throw e;
            }
        }
    }
    filterWhere(prop, value) {
        const whereFilter = (item) => item[prop] === value;
        const list = new List(this._modelConstructor);
        list._data = this.data.filter(whereFilter);
        return list;
    }
    filterContains(prop, value) {
        return this.filter((item) => Object.keys(item[prop]).includes(value));
    }
    /**
     * findWhere
     *
     * returns the first record in the list where the property equals the
     * specified value. If no value is found then an error is thrown unless
     * it is stated
     */
    findWhere(prop, value, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const list = this.META.isProperty(prop) ||
            (this.META.isRelationship(prop) &&
                this.META.relationship(prop).relType === "hasOne")
            ? this.filterWhere(prop, value)
            : this.filterContains(prop, value);
        if (list.length > 0) {
            return Record.createWith(this._modelConstructor, list._data[0]);
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const valid = this.META.isProperty(prop) ||
                    (this.META.isRelationship(prop) &&
                        this.META.relationship(prop).relType === "hasOne")
                    ? this.map((i) => i[prop])
                    : this.map((i) => Object.keys(i[prop]));
                const e = new Error(`List<${this.modelName}>.findWhere(${prop}, ${value}) was not found in the List [ length: ${this.data.length} ]. \n\nValid values include: \n\n${valid.join("\t")}`);
                e.name = "NotFound";
                throw e;
            }
        }
    }
    /**
     * provides a `map` function over the records managed by the List; there
     * will be no mutations to the data managed by the list
     */
    map(f) {
        return this.data.map(f);
    }
    /**
     * provides a `forEach` function to iterate over the records managed by the List
     */
    forEach(f) {
        this.data.forEach(f);
    }
    /**
     * runs a `reducer` function across all records in the list
     */
    reduce(f, initialValue = {}) {
        return this.data.reduce(f, initialValue);
    }
    /**
     * Gives access to the List's array of records
     */
    get data() {
        return this._data;
    }
    /**
     * Returns the Record object with the given ID, errors if not found (name: NotFound)
     * unless call signature includes "defaultIfNotFound"
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    findById(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const find = this.filter((f) => f.id === id);
        if (find.length === 0) {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            const e = new Error(`Could not find "${id}" in list of ${this.pluralName}`);
            e.name = "NotFound";
            throw e;
        }
        return Record.createWith(this._modelConstructor, find.data[0]);
    }
    async removeById(id, ignoreOnNotFound = false) {
        const rec = this.findById(id, null);
        if (!rec) {
            if (!ignoreOnNotFound) {
                throw new FireModelError(`Could not remove "${id}" in list of ${this.pluralName} as the ID was not found!`, `firemodel/not-allowed`);
            }
            else {
                return;
            }
        }
        const removed = await Record.remove(this._modelConstructor, id, rec);
        this._data = this.filter((f) => f.id !== id).data;
    }
    async add(payload) {
        const newRecord = await Record.add(this._modelConstructor, payload);
        this._data.push(newRecord.data);
        return newRecord;
    }
    /**
     * Returns the single instance of an object contained by the List container
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    getData(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        let record;
        try {
            record = this.findById(id, defaultIfNotFound);
            return record === defaultIfNotFound
                ? defaultIfNotFound
                : record.data;
        }
        catch (e) {
            if (e.name === "NotFound" && defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                throw e;
            }
        }
    }
    /**
     * Loads data into the `List` object
     */
    async load(pathOrQuery) {
        if (!this.db) {
            const e = new Error(`The attempt to load data into a List requires that the DB property be initialized first!`);
            e.name = "NoDatabase";
            throw e;
        }
        this._data = await this.db.getList(pathOrQuery);
        return this;
    }
    _injectDynamicDbOffsets(dbOffset) {
        if (dbOffset.indexOf(":") === -1) {
            return dbOffset;
        }
        const dynamicPathProps = Record.dynamicPathProperties(this._modelConstructor);
        Object.keys(this._offsets || {}).forEach((prop) => {
            if (dynamicPathProps.includes(prop)) {
                const value = this._offsets[prop];
                if (!["string", "number"].includes(typeof value)) {
                    throw new FireModelError(`The dynamic dbOffset is using the property "${prop}" on ${this.modelName} as a part of the route path but that property must be either a string or a number and instead was a ${typeof value}`, "record/not-allowed");
                }
                dbOffset = dbOffset.replace(`:${prop}`, String(value));
            }
        });
        if (dbOffset.includes(":")) {
            throw new FireModelError(`Attempt to get the dbPath of a List where the underlying model [ ${capitalize(this.modelName)} ] has dynamic path segments which were NOT supplied! The offsets provided were "${JSON.stringify(Object.keys(this._offsets || {}))}" but this leaves the following uncompleted dbOffset: ${dbOffset}`);
        }
        return dbOffset;
    }
}

const meta = {};
function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param modelKlass a model or record which exposes META property
 */
function getModelMeta(modelKlass) {
    const localMeta = modelKlass.META;
    const modelMeta = meta[modelKlass.modelName];
    return localMeta && localMeta.properties ? localMeta : modelMeta || {};
}
function modelsWithMeta() {
    return Object.keys(meta);
}

class Record extends FireModel {
    constructor(model, options = {}) {
        super();
        this.options = options;
        //#endregion STATIC: Relationships
        //#endregion
        //#region INSTANCE DEFINITION
        this._existsOnDB = false;
        this._writeOperations = [];
        this._data = {};
        if (!model) {
            throw new FireModelError(`You are trying to instantiate a Record but the "model constructor" passed in is empty!`, `firemodel/not-allowed`);
        }
        if (!model.constructor) {
            console.log(`The "model" property passed into the Record constructor is NOT a Model constructor! It is of type "${typeof model}": `, model);
            if (typeof model === "string") {
                model = FireModel.lookupModel(model);
                if (!model) {
                    throw new FireModelError(`Attempted to lookup the model in the registry but it was not found!`);
                }
            }
            else {
                throw new FireModelError(`Can not instantiate a Record without a valid Model constructor`);
            }
        }
        this._modelConstructor = model;
        this._model = new model();
        this._data = new model();
    }
    //#region STATIC INTERFACE
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    static get defaultDb() {
        return FireModel.defaultDb;
    }
    static set dispatch(fn) {
        FireModel.dispatch = fn;
    }
    /**
     * **dynamicPathProperties**
     *
     * An array of "dynamic properties" that are derived fom the "dbOffset" to
     * produce the "dbPath". Note: this does NOT include the `id` property.
     */
    static dynamicPathProperties(
    /**
     * the **Model** who's properties are being interogated
     */
    model) {
        return Record.create(model).dynamicPathComponents;
    }
    /**
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create(model, options = {}) {
        const r = new Record(model, options);
        if (options.silent && !r.db.isMockDb) {
            throw new FireModelError(`You can only add new records to the DB silently when using a Mock database!`, "forbidden");
        }
        return r;
    }
    /**
     * Creates an empty record and then inserts all values
     * provided along with default values provided in META.
     */
    static local(model, values, options = {}) {
        const rec = Record.create(model, options);
        if (!options.ignoreEmptyValues &&
            (!values || Object.keys(values).length === 0)) {
            throw new FireModelError("You used the static Record.local() method but passed nothing into the 'values' property! If you just want to skip this error then you can set the options to { ignoreEmptyValues: true } or just use the Record.create() method.", `firemodel/record::local`);
        }
        if (values) {
            const defaultValues = rec.META.properties.filter((i) => i.defaultValue !== undefined);
            // also include "default values"
            defaultValues.forEach((i) => {
                if (rec.get(i.property) === undefined) {
                    rec.set(i.property, i.defaultValue, true);
                }
            });
        }
        return rec;
    }
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param payload the data for the new record; this optionally can include the "id" but if left off the new record will use a firebase pushkey
     * @param options
     */
    static async add(model, payload, options = {}) {
        let r;
        if (typeof model === "string") {
            model = FireModel.lookupModel(model);
        }
        try {
            if (!model) {
                throw new FireModelError(`The model passed into the Record.add() static initializer was not defined! This is often the result of a circular dependency. Note that the "payload" sent into Record.add() was:\n\n${JSON.stringify(payload, null, 2)}`);
            }
            r = Record.createWith(model, payload, options);
            if (!payload.id) {
                const path = List.dbPath(model, payload);
                payload.id = await r.db.getPushKey(path);
            }
            await r._initialize(payload, options);
            const defaultValues = r.META.properties.filter((i) => i.defaultValue !== undefined);
            defaultValues.forEach((i) => {
                if (r.get(i.property) === undefined) {
                    r.set(i.property, i.defaultValue, true);
                }
            });
            await r._adding(options);
        }
        catch (e) {
            if (e.code === "permission-denied") {
                const rec = Record.createWith(model, payload);
                throw new FireModelError(`Permission error while trying to add the ${capitalize(rec.modelName)} to the database path ${rec.dbPath}`, "firemodel/permission-denied");
            }
            if (e.name.includes("firemodel")) {
                throw e;
            }
            throw new FireModelProxyError(e, "Failed to add new record ");
        }
        return r;
    }
    /**
     * **update**
     *
     * update an existing record in the database with a dictionary of prop/value pairs
     *
     * @param model the _model_ type being updated
     * @param id the `id` for the model being updated
     * @param updates properties to update; this is a non-destructive operation so properties not expressed will remain unchanged. Also, because values are _nullable_ you can set a property to `null` to REMOVE it from the database.
     * @param options
     */
    static async update(model, id, updates, options = {}) {
        let r;
        try {
            r = await Record.get(model, id, options);
            await r.update(updates);
        }
        catch (e) {
            const err = new Error(`Problem adding new Record: ${e.message}`);
            err.name = e.name !== "Error" ? e.name : "FireModel";
            throw e;
        }
        return r;
    }
    /**
     * Pushes a new item into a property that is setup as a "pushKey"
     *
     * @param model the model being operated on
     * @param id  `id` or `composite-key` that uniquely identifies a record
     * @param property the property on the record
     * @param payload the new payload you want to push into the array
     */
    static async pushKey(model, id, property, payload, options = {}) {
        const obj = await Record.get(model, id, options);
        return obj.pushKey(property, payload);
    }
    /**
     * **createWith**
     *
     * A static initializer that creates a Record of a given class
     * and then initializes the state with either a Model payload
     * or a CompositeKeyString (aka, '[id]::[prop]:[value]').
     *
     * You should be careful in using this initializer; the expected
     * _intents_ include:
     *
     * 1. to initialize an in-memory record of something which is already
     * in the DB
     * 2. to get all the "composite key" attributes into the record so
     * all META queries are possible
     *
     * If you want to add this record to the database then use `add()`
     * initializer instead.
     *
     * @prop model a constructor for the underlying model
     * @payload either a string representing an `id` or Composite Key or alternatively
     * a hash/dictionary of attributes that are to be set as a starting point
     */
    static createWith(model, payload, options = {}) {
        const rec = Record.create(model, options);
        if (options.setDeepRelationships === true) {
            throw new FireModelError(`Trying to create a ${capitalize(rec.modelName)} with the "setDeepRelationships" property set. This is NOT allowed; consider the 'Record.add()' method instead.`, "not-allowed");
        }
        const properties = typeof payload === "string"
            ? createCompositeKeyFromFkString(payload, rec.modelConstructor)
            : payload;
        // TODO: build some tests to ensure that ...
        // the async possibilites of this method (only if `options.setDeepRelationships`)
        // are not negatively impacting this method
        rec._initialize(properties, options);
        return rec;
    }
    /**
     * get (static initializer)
     *
     * Allows the retrieval of records based on the record's id (and dynamic path prefixes
     * in cases where that applies)
     *
     * @param model the model definition you are retrieving
     * @param id either just an "id" string or in the case of models with dynamic path prefixes you can pass in an object with the id and all dynamic prefixes
     * @param options
     */
    static async get(model, id, options = {}) {
        const record = Record.create(model, options);
        await record._getFromDB(id);
        return record;
    }
    static async remove(model, id, 
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState) {
        // TODO: add lookup in local state to see if we can avoid DB call
        const record = currentState ? currentState : await Record.get(model, id);
        await record.remove();
        return record;
    }
    //#region STATIC: Relationships
    /**
     * Associates a new FK to a relationship on the given `Model`; returning
     * the primary model as a return value
     */
    static async associate(model, id, property, refs) {
        const obj = await Record.get(model, id);
        await obj.associate(property, refs);
        return obj;
    }
    /**
     * Given a database _path_ and a `Model`, pull out the composite key from
     * the path. This works for Models that do and _do not_ have dynamic segments
     * and in both cases the `id` property will be returned as part of the composite
     * so long as the path does indeed have the `id` at the end of the path.
     */
    static getCompositeKeyFromPath(model, path) {
        if (!path) {
            return {};
        }
        const r = Record.create(model);
        const pathParts = dotNotation$1(path).split(".");
        const compositeKey = {};
        const segments = dotNotation$1(r.dbOffset).split(".");
        if (segments.length > pathParts.length ||
            pathParts.length - 2 > segments.length) {
            throw new FireModelError(`Attempt to get the composite key from a path failed due to the diparity of segments in the path [ ${pathParts.length} ] versus the dynamic path [ ${segments.length} ]`, "firemodel/not-allowed");
        }
        segments.forEach((segment, idx) => {
            if (segment.slice(0, 1) === ":") {
                const name = segment.slice(1);
                const value = pathParts[idx];
                compositeKey[name] = value;
            }
            else {
                if (segment !== pathParts[idx]) {
                    throw new FireModelError(`The attempt to build a composite key for the model ${capitalize(r.modelName)} failed because the static parts of the path did not match up. Specifically where the "dbOffset" states the segment "${segment}" the path passed in had "${pathParts[idx]}" instead.`);
                }
            }
            if (pathParts.length - 1 === segments.length) {
                compositeKey.id = pathParts.slice(-1);
            }
        });
        return compositeKey;
    }
    /**
     * Given a Model and a partial representation of that model, this will generate
     * a composite key (in _object_ form) that conforms to the `ICompositeKey` interface
     * and uniquely identifies the given record.
     *
     * @param model the class definition of the model you want the CompositeKey for
     * @param object the data which will be used to generate the Composite key from
     */
    static compositeKey(model, obj) {
        const dynamicSegments = Record.dynamicPathProperties(model).concat("id");
        return dynamicSegments.reduce((agg, prop) => {
            if (obj[prop] === undefined) {
                throw new FireModelError(`You used attempted to generate a composite key of the model ${Record.modelName(model)} but the property "${prop}" is part of they dynamic path and the data passed in did not have a value for this property.`, "firemodel/not-ready");
            }
            agg[prop] = obj[prop];
            return agg;
        }, {});
    }
    /**
     * Given a Model and a partial representation of that model, this will generate
     * a composite key in _string_ form that conforms to the `IPrimaryKey` interface
     * and uniquely identifies the given record.
     *
     * @param model the class definition of the model you want the CompositeKey for
     * @param object the data which will be used to generate the Composite key from
     */
    static compositeKeyRef(model, 
    /** either a partial model or just the `id` of the model if model is not a dynamic path */
    object) {
        if (Record.dynamicPathProperties(model).length === 0) {
            return typeof object === "string" ? object : object.id;
        }
        if (typeof object === "string") {
            if (object.includes(":")) {
                // Forward strings which already appear to be composite key reference
                return object;
            }
            else {
                throw new FireModelError(`Attempt to get a compositeKeyRef() but passed in a string/id value instead of a composite key for a model [ ${Record.modelName(model)}, "${object}" ] which HAS dynamic properties! Required props are: ${Record.dynamicPathProperties(model).join(", ")}`, "not-allowed");
            }
        }
        const compositeKey = Record.compositeKey(model, object);
        const nonIdKeys = Object.keys(compositeKey).reduce((agg, prop) => prop === "id" ? agg : agg.concat({ prop, value: compositeKey[prop] }), []);
        return `${compositeKey.id}::${nonIdKeys
            .map((tuple) => `${tuple.prop}:${tuple.value}`)
            .join("::")}`;
    }
    /**
     * Returns the name of the name of the `Model`.
     *
     * Note: it returns the name in PascalCase _not_
     * camelCase.
     */
    static modelName(model) {
        const r = Record.create(model);
        return capitalize(r.modelName);
    }
    get data() {
        return this._data;
    }
    get isDirty() {
        return this.META.isDirty ? true : false;
    }
    /**
     * deprecated
     */
    set isDirty(value) {
        if (!this._data.META) {
            this._data.META = { isDirty: value };
        }
        this._data.META.isDirty = value;
    }
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    get dbPath() {
        if (this.data.id ? false : true) {
            throw new FireModelError(`you can not ask for the dbPath before setting an "id" property [ ${this.modelName} ]`, "record/not-ready");
        }
        return [
            this._injectDynamicPathProperties(this.dbOffset),
            this.pluralName,
            this.data.id,
        ].join("/");
    }
    /**
     * provides a boolean flag which indicates whether the underlying
     * model has a "dynamic path" which ultimately comes from a dynamic
     * component in the "dbOffset" property defined in the model decorator
     */
    get hasDynamicPath() {
        return this.META.dbOffset.includes(":");
    }
    /**
     * **dynamicPathComponents**
     *
     * An array of "dynamic properties" that are derived fom the "dbOffset" to
     * produce the "dbPath"
     */
    get dynamicPathComponents() {
        return this._findDynamicComponents(this.META.dbOffset);
    }
    /**
     * the list of dynamic properties in the "localPrefix"
     * which must be resolved to achieve the "localPath"
     */
    get localDynamicComponents() {
        return this._findDynamicComponents(this.META.localPrefix);
    }
    /**
     * A hash of values -- including at least "id" -- which represent
     * the composite key of a model.
     */
    get compositeKey() {
        return createCompositeKey(this);
    }
    /**
     * a string value which is used in relationships to fully qualify
     * a composite string (aka, a model which has a dynamic dbOffset)
     */
    get compositeKeyRef() {
        return createCompositeKeyRefFromRecord(this);
    }
    /**
     * The Record's primary key; this is the `id` property only. Not
     * the composite key.
     */
    get id() {
        return this.data.id;
    }
    /**
     * Allows setting the Record's `id` if it hasn't been set before.
     * Resetting the `id` is not allowed.
     */
    set id(val) {
        if (this.data.id) {
            throw new FireModelError(`You may not re-set the ID of a record [ ${this.modelName}.id ${this.data.id} => ${val} ].`, "firemodel/not-allowed");
        }
        this._data.id = val;
    }
    /**
     * Returns the record's database _offset_ without the ID or any dynamic properties
     * yet interjected. The _dynamic properties_ however, will be show with a `:` prefix
     * to indicate where the the values will go.
     */
    get dbOffset() {
        return getModelMeta(this).dbOffset;
    }
    /**
     * returns the record's location in the frontend state management framework;
     * this can include dynamic properties characterized in the path string by
     * leading ":" character.
     */
    get localPath() {
        let prefix = this.localPrefix;
        this.localDynamicComponents.forEach((prop) => {
            // TODO: another example of impossible typing coming off of a get()
            prefix = prefix.replace(`:${prop}`, this.get(prop));
        });
        return pathJoin(prefix, this.META.localModelName !== this.modelName
            ? this.META.localModelName
            : this.options.pluralizeLocalPath
                ? this.pluralName
                : this.modelName);
    }
    /**
     * The path in the local state tree that brings you to
     * the record; this is differnt when retrieved from a
     * Record versus a List.
     */
    get localPrefix() {
        return getModelMeta(this).localPrefix;
    }
    get existsOnDB() {
        return this.data && this.data.id ? true : false;
    }
    /** indicates whether this record is already being watched locally */
    get isBeingWatched() {
        return FireModel.isBeingWatched(this.dbPath);
    }
    get modelConstructor() {
        return this._modelConstructor;
    }
    /**
     * Goes out to the database and reloads this record
     */
    async reload() {
        const reloaded = await Record.get(this._modelConstructor, this.compositeKeyRef);
        return reloaded;
    }
    /**
     * addAnother
     *
     * Allows a simple way to add another record to the database
     * without needing the model's constructor fuction. Note, that
     * the payload of the existing record is ignored in the creation
     * of the new.
     *
     * @param payload the payload of the new record
     */
    async addAnother(payload, options = {}) {
        const newRecord = await Record.add(this._modelConstructor, payload, options);
        return newRecord;
    }
    isSameModelAs(model) {
        return this._modelConstructor === model;
    }
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    async pushKey(property, value) {
        if (this.META.pushKeys.indexOf(property) === -1) {
            throw new FireModelError(`Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`, "invalid-operation/not-pushkey");
        }
        if (!this.existsOnDB) {
            throw new FireModelError(`Invalid Operation: you can not push to property "${property}" before saving the record to the database`, "invalid-operation/not-on-db");
        }
        const key$1 = this.db.isMockDb
            ? key()
            : await this.db.getPushKey(pathJoin(this.dbPath, property));
        await this.db.update(pathJoin(this.dbPath, property), {
            [pathJoin(this.dbPath, property, key$1)]: value,
            [pathJoin(this.dbPath, "lastUpdated")]: new Date().getTime(),
        });
        // set firemodel state locally
        const currentState = this.get(property) || {};
        const newState = { ...currentState, [key$1]: value };
        await this.set(property, newState);
        return key$1;
    }
    /**
     * **update**
     *
     * Updates a set of properties on a given model atomically (aka, all at once);
     * will automatically include the "lastUpdated" property. Does NOT
     * allow relationships to be included, this should be done separately.
     *
     * If you want to remove a particular property but otherwise leave the object
     * unchanged, you can set that values(s) to NULL and it will be removed without
     * impact to other properties.
     *
     * @param props a hash of name value pairs which represent the props being
     * updated and their new values
     */
    async update(props) {
        const meta = getModelMeta(this);
        if (!meta.property) {
            throw new FireModelError(`There is a problem with this record's META information [ model: ${capitalize(this.modelName)}, id: ${this.id} ]. The property() method -- used to dig into properties on any given model appears to be missing!`, "firemodel/meta-missing");
        }
        // can not update relationship properties
        if (Object.keys(props).some((key) => {
            const root = key.split(".")[0];
            const rootProperties = meta.property(root);
            if (!rootProperties) {
                throw new FireModelError(`While this record [ model: ${capitalize(this.modelName)}, id: ${this.id} ] does return a "META.property" function, looking up the property "${root}" has resulted in an invalid response [${typeof rootProperties}]`);
            }
            return rootProperties.isRelationship;
        })) {
            const relProps = Object.keys(props).filter((p) => meta.property(p).isRelationship);
            throw new FireModelError(`You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(", ")}.`, `firemodel/not-allowed`);
        }
        const lastUpdated = new Date().getTime();
        const changed = {
            ...props,
            lastUpdated,
        };
        const rollback = copy(this.data);
        // changes local Record to include updates immediately
        this._data = { ...this.data, ...changed };
        // performs a two phase commit using dispatch messages
        await this._localCrudOperation("update" /* update */, rollback);
        return;
    }
    /**
     * **remove**
     *
     * Removes the active record from the database and dispatches the change to
     * FE State Mgmt.
     */
    async remove() {
        this.isDirty = true;
        await this._localCrudOperation("remove" /* remove */, copy(this.data));
        this.isDirty = false;
        // TODO: handle dynamic paths and also consider removing relationships
    }
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     * @param silent a flag to indicate whether the change to the prop should be updated
     * to the database or not
     */
    async set(prop, value, silent = false) {
        const rollback = copy(this.data);
        const meta = this.META.property(prop);
        if (!meta) {
            throw new FireModelError(`There was a problem getting the meta data for the model ${capitalize(this.modelName)} while attempting to set the "${prop}" property to: ${value}`);
        }
        if (meta.isRelationship) {
            throw new FireModelError(`You can not "set" the property "${prop}" because it is configured as a relationship!`, "firemodel/not-allowed");
        }
        const lastUpdated = new Date().getTime();
        const changed = {
            [prop]: value,
            lastUpdated,
        };
        // locally change Record values
        this.META.isDirty = true;
        this._data = { ...this._data, ...changed };
        // dispatch
        if (!silent) {
            await this._localCrudOperation("update" /* update */, rollback, {
                silent,
            });
            this.META.isDirty = false;
        }
        return;
    }
    /**
     * **associate**
     *
     * Associates the current model with another entity
     * regardless if the cardinality
     */
    async associate(property, 
    // TODO: ideally stronger typing
    refs, options = {}) {
        const meta = getModelMeta(this);
        if (!meta.relationship(property)) {
            throw new FireModelError(`Attempt to associate the property "${property}" can not be done on model ${capitalize(this.modelName)} because the property is not defined!`, `firemodel/not-allowed`);
        }
        if (!meta.relationship(property).relType) {
            throw new FireModelError(`For some reason the property "${property}" on the model ${capitalize(this.modelName)} doesn't have cardinality assigned to the "relType" (aka, hasMany, hasOne).\n\nThe META for relationships on the model are: ${JSON.stringify(meta.relationships, null, 2)}`, `firemodel/unknown`);
        }
        const relType = meta.relationship(property).relType;
        if (relType === "hasMany") {
            await this.addToRelationship(property, refs, options);
        }
        else {
            if (Array.isArray(refs)) {
                if (refs.length === 1) {
                    refs = refs.pop();
                }
                else {
                    throw new FireModelError(`Attempt to use "associate()" with a "hasOne" relationship [ ${property}] on the model ${capitalize(this.modelName)}.`, "firemodel/invalid-cardinality");
                }
            }
            await this.setRelationship(property, refs, options);
        }
    }
    /**
     * **disassociate**
     *
     * Removes an association between the current model and another entity
     * (regardless of the cardinality in the relationship)
     */
    async disassociate(property, 
    // TODO: ideally stronger typing below
    refs, options = {}) {
        const relType = this.META.relationship(property).relType;
        if (relType === "hasMany") {
            await this.removeFromRelationship(property, refs, options);
        }
        else {
            await this.clearRelationship(property, options);
        }
    }
    /**
     * Adds one or more fk's to a hasMany relationship.
     *
     * Every relationship will be added as a "single transaction", meaning that ALL
     * or NONE of the relationshiop transactions will succeed. If you want to
     * take a more optimistic approach that accepts each relationship pairing (PK/FK)
     * then you should manage the iteration outside of this call and let this call
     * only manage the invidual PK/FK transactions (which should ALWAYS be atomic).
     *
     * @param property the property which is acting as a foreign key (array)
     * @param fkRefs FK reference (or array of FKs) that should be added to reln
     * @param options change the behavior of this relationship transaction
     */
    async addToRelationship(property, fkRefs, options = {}) {
        const altHasManyValue = options.altHasManyValue || true;
        if (!isHasManyRelationship(this, property)) {
            throw new NotHasManyRelationship(this, property, "addToRelationship");
        }
        fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
        let paths = [];
        const now = new Date().getTime();
        fkRefs.map((ref) => {
            paths = [
                ...buildRelationshipPaths(this, property, ref, {
                    now,
                    altHasManyValue,
                }),
                ...paths,
            ];
        });
        await relationshipOperation(this, "add", property, fkRefs, paths, options);
    }
    /**
     * removeFromRelationship
     *
     * remove one or more FK's from a `hasMany` relationship
     *
     * @param property the property which is acting as a FK
     * @param fkRefs the FK's on the property which should be removed
     */
    async removeFromRelationship(property, fkRefs, options = {}) {
        if (!isHasManyRelationship(this, property)) {
            throw new NotHasManyRelationship(this, property, "removeFromRelationship");
        }
        fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
        let paths = [];
        const now = new Date().getTime();
        fkRefs.map((ref) => {
            paths = [
                ...buildRelationshipPaths(this, property, ref, {
                    now,
                    operation: "remove",
                }),
                ...paths,
            ];
        });
        await relationshipOperation(this, "remove", property, fkRefs, paths, options);
    }
    /**
     * **clearRelationship**
     *
     * clears an existing FK on a `hasOne` relationship or _all_ FK's on a
     * `hasMany` relationship
     *
     * @param property the property containing the relationship to an external
     * entity
     */
    async clearRelationship(property, options = {}) {
        const relType = this.META.relationship(property).relType;
        const fkRefs = relType === "hasMany"
            ? this._data[property]
                ? Object.keys(this.get(property))
                : []
            : this._data[property]
                ? [this.get(property)]
                : [];
        let paths = [];
        const now = new Date().getTime();
        fkRefs.map((ref) => {
            paths = [
                ...buildRelationshipPaths(this, property, ref, {
                    now,
                    operation: "remove",
                }),
                ...paths,
            ];
        });
        await relationshipOperation(this, "clear", property, fkRefs, paths, options);
    }
    /**
     * **setRelationship**
     *
     * sets up an FK relationship for a _hasOne_ relationship
     *
     * @param property the property containing the hasOne FK
     * @param ref the FK
     */
    async setRelationship(property, fkId, options = {}) {
        if (!fkId) {
            throw new FireModelError(`Failed to set the relationship ${this.modelName}.${property} because no FK was passed in!`, "firemodel/not-allowed");
        }
        if (isHasManyRelationship(this, property)) {
            throw new NotHasOneRelationship(this, property, "setRelationship");
        }
        const paths = buildRelationshipPaths(this, property, fkId);
        await relationshipOperation(this, "set", property, [fkId], paths, options);
    }
    //#endregion INSTANCE DEFINITION
    /**
     * get a property value from the record
     *
     * @param prop the property being retrieved
     */
    get(prop) {
        return this.data[prop];
    }
    toString() {
        return `Record::${this.modelName}@${this.id || "undefined"}`;
    }
    toJSON() {
        return {
            dbPath: this.dbPath,
            modelName: this.modelName,
            pluralName: this.pluralName,
            key: this.id,
            compositeKey: this.compositeKey,
            localPath: this.localPath,
            data: this.data.toString(),
        };
    }
    //#endregion
    //#region PRIVATE METHODS
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    async _initialize(data, options = {}) {
        if (data) {
            Object.keys(data).map((key) => {
                this._data[key] = data[key];
            });
        }
        const relationships = getModelMeta(this).relationships;
        const hasOneRels = (relationships || [])
            .filter((r) => r.relType === "hasOne")
            .map((r) => r.property);
        const hasManyRels = (relationships || [])
            .filter((r) => r.relType === "hasMany")
            .map((r) => r.property);
        const promises = [];
        /**
         * Sets hasMany to default `{}` if nothing was set.
         * Also, if the option `deepRelationships` is set to `true`,
         * it will look for relationships hashes instead of the typical
         * `fk: true` pairing.
         */
        for (const oneToManyProp of hasManyRels) {
            if (!this._data[oneToManyProp]) {
                this._data[oneToManyProp] = {};
            }
            if (options.setDeepRelationships) {
                if (this._data[oneToManyProp]) {
                    promises.push(buildDeepRelationshipLinks(this, oneToManyProp));
                }
            }
        }
        await Promise.all(promises);
        const now = new Date().getTime();
        if (!this._data.lastUpdated) {
            this._data.lastUpdated = now;
        }
        if (!this._data.createdAt) {
            this._data.createdAt = now;
        }
    }
    /**
     * **_writeAudit**
     *
     * Writes an audit log if the record is configured for audit logs
     */
    async _writeAudit(action, currentValue, priorValue) {
        currentValue = currentValue ? currentValue : {};
        priorValue = priorValue ? priorValue : {};
        try {
            if (this.META.audit) {
                const deltas = compareHashes(currentValue, priorValue);
                const auditLogEntries = [];
                const added = deltas.added.forEach((a) => auditLogEntries.push({
                    action: "added",
                    property: a,
                    before: null,
                    after: currentValue[a],
                }));
                deltas.changed.forEach((c) => auditLogEntries.push({
                    action: "updated",
                    property: c,
                    before: priorValue[c],
                    after: currentValue[c],
                }));
                const removed = deltas.removed.forEach((r) => auditLogEntries.push({
                    action: "removed",
                    property: r,
                    before: priorValue[r],
                    after: null,
                }));
                const pastTense = {
                    add: "added",
                    update: "updated",
                    remove: "removed",
                };
                await writeAudit(this, pastTense[action], auditLogEntries, { db: this.db });
            }
        }
        catch (e) {
            throw new FireModelProxyError(e);
        }
    }
    /**
     * **_localCrudOperation**
     *
     * updates properties on a given Record while firing
     * two-phase commit EVENTs to dispatch:
     *
     *  local: `RECORD_[ADDED,CHANGED,REMOVED]_LOCALLY`
     *  server: `RECORD_[ADDED,CHANGED,REMOVED]_CONFIRMATION`
     *
     * Note: if there is an error a
     * `RECORD_[ADDED,CHANGED,REMOVED]_ROLLBACK` event will be sent
     * to dispatch instead of the server dispatch message
     * illustrated above.
     *
     * Another concept that is sometimes not clear ... when a
     * successful transaction is achieved you will by default get
     * both sides of the two-phase commit. If you have a watcher
     * watching this same path then that watcher will also get
     * a dispatch message sent (e.g., RECORD_ADDED, RECORD_REMOVED, etc).
     *
     * If you only want to hear about Firebase's acceptance of the
     * record from a watcher then you can opt-out by setting the
     * { silentAcceptance: true } parameter in options. If you don't
     * want either side of the two phase commit sent to dispatch
     * you can mute both with { silent: true }. This option is not
     * typically a great idea but it can be useful in situations like
     * _mocking_
     */
    async _localCrudOperation(crudAction, priorValue, options = {}) {
        options = {
            ...{ silent: false, silentAcceptance: false },
            ...options,
        };
        const transactionId = "t-" +
            Math.random().toString(36).substr(2, 5) +
            "-" +
            Math.random().toString(36).substr(2, 5);
        const lookup = {
            add: [
                FmEvents.RECORD_ADDED_LOCALLY,
                FmEvents.RECORD_ADDED_CONFIRMATION,
                FmEvents.RECORD_ADDED_ROLLBACK,
            ],
            update: [
                FmEvents.RECORD_CHANGED_LOCALLY,
                FmEvents.RECORD_CHANGED_CONFIRMATION,
                FmEvents.RECORD_CHANGED_ROLLBACK,
            ],
            remove: [
                FmEvents.RECORD_REMOVED_LOCALLY,
                FmEvents.RECORD_REMOVED_CONFIRMATION,
                FmEvents.RECORD_REMOVED_ROLLBACK,
            ],
        };
        const [actionTypeStart, actionTypeEnd, actionTypeFailure] = lookup[crudAction];
        this.isDirty = true;
        // Set aside prior value
        const { changed, added, removed } = compareHashes(withoutMetaOrPrivate(this.data), withoutMetaOrPrivate(priorValue));
        const watchers = findWatchers(this.dbPath);
        const event = {
            transactionId,
            modelConstructor: this.modelConstructor,
            kind: "record",
            operation: crudAction,
            eventType: "local",
            key: this.id,
            value: withoutMetaOrPrivate(this.data),
            priorValue,
        };
        if (crudAction === "update") {
            event.priorValue = priorValue;
            event.added = added;
            event.changed = changed;
            event.removed = removed;
        }
        if (watchers.length === 0) {
            if (!options.silent) {
                // Note: if used on frontend, the mutations must be careful to
                // set this to the right path considering there is no watcher
                await this.dispatch(UnwatchedLocalEvent(this, {
                    type: actionTypeStart,
                    ...event,
                    value: withoutMetaOrPrivate(this.data),
                }));
            }
        }
        else {
            // For each watcher watching this DB path ...
            const dispatch = WatchDispatcher(this.dispatch);
            for (const watcher of watchers) {
                if (!options.silent) {
                    await dispatch(watcher)({ type: actionTypeStart, ...event });
                }
            }
        }
        // Send CRUD to Firebase
        try {
            if (this.db.isMockDb && this.db.mock && options.silent) {
                this.db.mock.silenceEvents();
            }
            this._data.lastUpdated = new Date().getTime();
            const path = this.dbPath;
            switch (crudAction) {
                case "remove":
                    try {
                        const test = this.dbPath;
                    }
                    catch (e) {
                        throw new FireModelProxyError(e, `The attempt to "remove" the ${capitalize(this.modelName)} with ID of "${this.id}" has been aborted. This is often because you don't have the right properties set for the dynamic path. This model requires the following dynamic properties to uniquely define (and remove) it: ${this.dynamicPathComponents.join(", ")}`);
                    }
                    // Check for relationship props and dis-associate
                    // before removing the actual record
                    // TODO: need to add tests for this!
                    for (const rel of this.relationships) {
                        const relProperty = this.get(rel.property);
                        try {
                            if (rel.relType === "hasOne" && relProperty) {
                                await this.disassociate(rel.property, this.get(rel.property));
                            }
                            else if (rel.relType === "hasMany" && relProperty) {
                                for (const relFk of Object.keys(relProperty)) {
                                    await this.disassociate(rel.property, relFk);
                                }
                            }
                        }
                        catch (e) {
                            throw new FireModelProxyError(e, `While trying to remove ${capitalize(this.modelName)}.${this.id} from the database, problems were encountered removing the relationship defined by the "${rel.property} property (which relates to the model ${rel.fkModelName}). This relationship has a cardinality of "${rel.relType}" and the value(s) were: ${rel.relType === "hasOne"
                                ? Object.keys(this.get(rel.property))
                                : this.get(rel.property)}`);
                        }
                    }
                    await this.db.remove(this.dbPath);
                    break;
                case "add":
                    try {
                        await this.db.set(path, this.data);
                    }
                    catch (e) {
                        throw new FireModelProxyError(e, `Problem setting the "${path}" database path. Data passed in was of type ${typeof this
                            .data}. Error message encountered was: ${e.message}`, `firemodel/${(e.code = "PERMISSION_DENIED"
                            ? "permission-denied"
                            : "set-db")}`);
                    }
                    break;
                case "update":
                    const paths = this._getPaths(this, { changed, added, removed });
                    this.db.update("/", paths);
                    break;
            }
            this.isDirty = false;
            // write audit if option is turned on
            this._writeAudit(crudAction, this.data, priorValue);
            // send confirm event
            if (!options.silent && !options.silentAcceptance) {
                if (watchers.length === 0) {
                    await this.dispatch(UnwatchedLocalEvent(this, {
                        type: actionTypeEnd,
                        ...event,
                        transactionId,
                        value: withoutMetaOrPrivate(this.data),
                    }));
                }
                else {
                    const dispatch = WatchDispatcher(this.dispatch);
                    for (const watcher of watchers) {
                        if (!options.silent) {
                            await dispatch(watcher)({ type: actionTypeEnd, ...event });
                        }
                    }
                }
            }
            if (this.db.isMockDb && this.db.mock && options.silent) {
                this.db.mock.restoreEvents();
            }
        }
        catch (e) {
            // send failure event
            await this.dispatch(UnwatchedLocalEvent(this, {
                type: actionTypeFailure,
                ...event,
                transactionId,
                value: withoutMetaOrPrivate(this.data),
            }));
            throw new RecordCrudFailure(this, crudAction, transactionId, e);
        }
    }
    _findDynamicComponents(path = "") {
        if (!path.includes(":")) {
            return [];
        }
        const results = [];
        let remaining = path;
        let index = remaining.indexOf(":");
        while (index !== -1) {
            remaining = remaining.slice(index);
            const prop = remaining.replace(/\:(\w+).*/, "$1");
            results.push(prop);
            remaining = remaining.replace(`:${prop}`, "");
            index = remaining.indexOf(":");
        }
        return results;
    }
    /**
     * looks for ":name" property references within the dbOffset or localPrefix and expands them
     */
    _injectDynamicPathProperties(path, forProp = "dbOffset") {
        this.dynamicPathComponents.forEach((prop) => {
            const value = this.data[prop];
            if (value ? false : true) {
                throw new FireModelError(`You can not ask for the ${forProp} on a model like "${this.modelName}" which has a dynamic property of "${prop}" before setting that property [ data: ${JSON.stringify(this.data)} ].`, "record/not-ready");
            }
            if (!["string", "number"].includes(typeof value)) {
                throw new FireModelError(`The path is using the property "${prop}" on ${this.modelName} as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`, "record/not-allowed");
            }
            path = path.replace(`:${prop}`, String(this.get(prop)));
        });
        return path;
    }
    /**
     * Load data from a record in database; works with `get` static initializer
     */
    async _getFromDB(id) {
        const keys = typeof id === "string"
            ? createCompositeKeyFromFkString(id, this.modelConstructor)
            : id;
        // load composite key into props so the dbPath() will evaluate
        Object.keys(keys).map((key) => {
            // TODO: fix up typing
            this._data[key] = keys[key];
        });
        const data = await this.db.getRecord(this.dbPath);
        if (data && data.id) {
            await this._initialize(data);
        }
        else {
            throw new FireModelError(`Failed to load the Record "${this.modelName}::${this.id}" with composite key of:\n ${JSON.stringify(keys, null, 2)}`, "firebase/invalid-composite-key");
        }
        return this;
    }
    /**
     * Allows for the static "add" method to add a record
     */
    async _adding(options) {
        if (!this.id) {
            this.id = key();
        }
        const now = new Date().getTime();
        if (!this.get("createdAt")) {
            this._data.createdAt = now;
        }
        this._data.lastUpdated = now;
        // TODO: need to ensure that relationship which are set
        // are updated using the _relationship_ based methods associate/disassociate
        // so that bi-lateral relationships are established/maintained
        if (!this.db) {
            throw new FireModelError(`An attempt to add a ${capitalize(this.modelName)} record failed as the Database has not been connected yet. Try setting FireModel's defaultDb first.`, "firemodel/db-not-ready");
        }
        await this._localCrudOperation("add" /* add */, undefined, options);
        // now that the record has been added we need to follow-up with any relationship fk's that
        // were part of this record. For these we must run an `associate` over them to ensure that
        // inverse properties are established in the inverse direction
        const relationshipsTouched = this.relationships
            .reduce((agg, rel) => {
            if (rel.relType === "hasMany" &&
                Object.keys(this.data[rel.property]).length > 0) {
                return agg.concat(rel.property);
            }
            else if (rel.relType === "hasOne" && this.data[rel.property]) {
                return agg.concat(rel.property);
            }
            else {
                return agg;
            }
        }, [])
            .filter((prop) => this.META.relationship(prop).inverseProperty);
        const promises = [];
        try {
            for (const prop of relationshipsTouched) {
                const meta = this.META.relationship(prop);
                if (meta.relType === "hasOne") {
                    // TODO: why is this damn typing so difficult?
                    promises.push(this.associate(prop, this.get(prop)));
                }
                if (meta.relType === "hasMany") {
                    Object.keys(this.get(prop)).forEach((fkRef) => promises.push(this.associate(prop, fkRef)));
                }
            }
            await Promise.all(promises);
        }
        catch (e) {
            throw new FireModelProxyError(e, `An ${capitalize(this.modelName)} [${this.id}] model was being added but when attempting to add in the relationships which were inferred by the record payload it ran into problems. The relationship(s) which had properties defined -- and which had a bi-lateral FK relationship (e.g., both models will track the relationship versus just the ${capitalize(this.modelName)} [${this.id} model) --  were: ${relationshipsTouched.join(", ")}`);
        }
        return this;
    }
}

let chalk;
class VerboseError extends Error {
    constructor(err, ...args) {
        super(...args);
        this.code = err.code;
        this.message = err.message;
        this.module = err.module;
        this.function = err.function;
        if (VerboseError.useColor) {
            // tslint:disable-next-line:no-implicit-dependencies
            chalk = require("chalk");
        }
        const stackFrames = VerboseError.stackParser(this);
        if (stackFrames) {
            this.stackFrames = stackFrames.filter(frame => (frame.getFileName() || "").indexOf("common-types") === -1);
            this.function = stackFrames[0].getMethodName();
            this.stack =
                this.message +
                    "\n\n" +
                    this.stackFrames
                        .map(frame => {
                        const isNative = typeof frame.isNative === "function" ? frame.isNative() : frame.isNative;
                        const colorize = (content) => VerboseError.useColor && isNative ? chalk.grey.italic(content) : content;
                        const className = frame.getTypeName() ? frame.getTypeName() + " → " : "";
                        const functionName = frame.getMethodName() || frame.getFunctionName() || "<anonymous>";
                        const classAndFunction = VerboseError.useColor
                            ? chalk.bold(`${className}${functionName}`)
                            : `${className}${functionName}`;
                        const fileName = (frame.getFileName() || "")
                            .split("/")
                            .slice(-1 * VerboseError.filePathDepth)
                            .join("/");
                        const details = isNative
                            ? "( native function )"
                            : `[ line ${frame.getLineNumber()}, col ${frame.getColumnNumber()} in ${fileName} ]`;
                        return colorize(`\t at ${classAndFunction} ${details}`);
                    })
                        .join("\n");
        }
        else {
            this.stack = this.stack
                .split("\n")
                .filter(line => line.indexOf("VerboseError") === -1)
                .join("\n");
        }
    }
    /**
     * If you want to use a library like stack-trace(node) or stacktrace-js(client) add in the "get"
     * function that they provide
     */
    static setStackParser(fn) {
        VerboseError.stackParser = fn;
    }
    static stackParser(err) {
        return undefined;
    }
    toString() {
        return this.message + this.stack;
    }
    toJSON() {
        return JSON.stringify(this.toObject(), null, 2);
    }
    toObject() {
        return {
            code: this.code,
            message: this.message,
            module: this.module
        };
    }
}

/**
 * A static library for interacting with _watchers_. It
 * provides the entry point into the watcher API and then
 * hands off to either `WatchList` or `WatchRecord`.
 */
class Watch {
    /**
     * Sets the default database for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    /**
     * Sets the default dispatch for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set dispatch(d) {
        FireModel.dispatch = d;
    }
    /**
     * returns a full list of all watchers
     */
    static get inventory() {
        return getWatcherPool();
    }
    static toJSON() {
        return Watch.inventory;
    }
    /**
     * lookup
     *
     * Allows the lookup of details regarding the actively watched
     * objects in the Firebase database
     *
     * @param hashCode the unique hashcode given for each watcher
     */
    static lookup(hashCode) {
        const codes = new Set(Object.keys(getWatcherPool()));
        if (!codes.has(hashCode)) {
            const e = new Error(`You looked up an invalid watcher hashcode [${hashCode}].`);
            e.name = "FireModel::InvalidHashcode";
            throw e;
        }
        return getWatcherPool()[hashCode];
    }
    static get watchCount() {
        return Object.keys(getWatcherPool()).length;
    }
    static reset() {
        clearWatcherPool();
    }
    /**
     * Finds the watcher by a given name and returns the ID of the
     * first match
     */
    static findByName(name) {
        const pool = getWatcherPool();
        return Object.keys(pool).find((i) => pool[i].watcherName === name);
    }
    /**
     * stops watching either a specific watcher or ALL if no hash code is provided
     */
    static stop(hashCode, oneOffDB) {
        const codes = new Set(Object.keys(getWatcherPool()));
        const db = oneOffDB || FireModel.defaultDb;
        if (!db) {
            throw new FireModelError(`There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`, `firemodel/no-database`);
        }
        if (hashCode && !codes.has(hashCode)) {
            const e = new FireModelError(`The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`);
            e.name = "firemodel/missing-hashcode";
            throw e;
        }
        if (!hashCode) {
            const pool = getWatcherPool();
            if (Object.keys(pool).length > 0) {
                const keysAndPaths = Object.keys(pool).reduce((agg, key) => ({ ...agg, [key]: pool[key].watcherPaths }), {});
                const dispatch = pool[firstKey(pool)].dispatch;
                db.unWatch();
                clearWatcherPool();
                dispatch({
                    type: FmEvents.WATCHER_STOPPED_ALL,
                    stopped: keysAndPaths,
                });
            }
        }
        else {
            const registry = getWatcherPool()[hashCode];
            const events = registry.eventFamily === "child"
                ? "value"
                : ["child_added", "child_changed", "child_moved", "child_removed"];
            db.unWatch(events, registry.dispatch);
            // tslint:disable-next-line: no-object-literal-type-assertion
            registry.dispatch({
                type: FmEvents.WATCHER_STOPPED,
                watcherId: hashCode,
                remaining: getWatcherPoolList().map((i) => ({
                    id: i.watcherId,
                    name: i.watcherName,
                })),
            });
            removeFromWatcherPool(hashCode);
        }
    }
    /**
     * Configures the watcher to be a `value` watcher on Firebase
     * which is only concerned with changes to a singular Record.
     *
     * @param pk the _primary key_ for a given record. This can be a string
     * represention of the `id` property, a string represention of
     * the composite key, or an object representation of the composite
     * key.
     */
    static record(modelConstructor, pk, options = {}) {
        return WatchRecord.record(modelConstructor, pk, options);
    }
    static list(
    /**
     * The **Model** subType which this list watcher will watch
     */
    modelConstructor, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    offsets) {
        return WatchList.list(modelConstructor, { offsets });
    }
}

const moreThanThreePeriods = /\.{3,}/g;
// polyfill Array.isArray if necessary
if (!Array.isArray) {
    Array.isArray = (arg) => {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
const errorStr = (type) => {
    return `tried to join something other than undefined, a string or an array [${type}], it was ignored in pathJoin's result`;
};
/** An ISO-morphic path join that works everywhere */
function pathJoin(...args) {
    return args
        .reduce((prev, val) => {
        if (typeof prev === "undefined") {
            return;
        }
        if (val === undefined) {
            return prev;
        }
        return typeof val === "string" || typeof val === "number"
            ? joinStringsWithSlash(prev, "" + val) // if string or number just keep as is
            : Array.isArray(val)
                ? joinStringsWithSlash(prev, pathJoin.apply(null, val)) // handle array with recursion
                : console.error(errorStr(typeof val));
    }, "")
        .replace(moreThanThreePeriods, ".."); // join the resulting array together
}
function joinStringsWithSlash(str1, str2) {
    const str1isEmpty = !str1.length;
    const str1EndsInSlash = str1[str1.length - 1] === "/";
    const str2StartsWithSlash = str2[0] === "/";
    const res = (str1EndsInSlash && str2StartsWithSlash && str1 + str2.slice(1)) ||
        (!str1EndsInSlash &&
            !str2StartsWithSlash &&
            !str1isEmpty &&
            str1 + "/" + str2) ||
        str1 + str2;
    return res;
}

function normalized(...args) {
    return args
        .filter((a) => a)
        .map((a) => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
        .map((a) => a.replace(/\./g, "/"));
}
function slashNotation(...args) {
    return normalized(...args).join("/");
}
function firstKey(thingy) {
    return Object.keys(thingy)[0];
}
function dotNotation(...args) {
    return normalized(...args)
        .join(".")
        .replace("/", ".");
}
function updateToAuditChanges(changed, prior) {
    return Object.keys(changed).reduce((prev, curr) => {
        const after = changed[curr];
        const before = prior[curr];
        const propertyAction = !before ? "added" : !after ? "removed" : "updated";
        const payload = {
            before,
            after,
            property: curr,
            action: propertyAction,
        };
        prev.push(payload);
        return prev;
    }, []);
}
function compareHashes(from, to, 
/**
 * optionally explicitly state properties so that relationships
 * can be filtered away
 */
modelProps) {
    const results = {
        added: [],
        changed: [],
        removed: [],
    };
    from = from ? from : {};
    to = to ? to : {};
    let keys = Array.from(new Set([
        ...Object.keys(from),
        ...Object.keys(to),
    ]))
        // META should never be part of comparison
        .filter((i) => i !== "META")
        // neither should private properties indicated by underscore
        .filter((i) => i.slice(0, 1) !== "_");
    if (modelProps) {
        keys = keys.filter((i) => modelProps.includes(i));
    }
    keys.forEach((i) => {
        if (!to[i]) {
            results.added.push(i);
        }
        else if (from[i] === null) {
            results.removed.push(i);
        }
        else if (!equal(from[i], to[i])) {
            results.changed.push(i);
        }
    });
    return results;
}
function getAllPropertiesFromClassStructure(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties.map((p) => p.property);
}
function withoutMetaOrPrivate(model) {
    if (model && model.META) {
        model = { ...model };
        delete model.META;
    }
    return model;
}
function capitalize(str) {
    return str ? str.slice(0, 1).toUpperCase() + str.slice(1) : "";
}
function lowercase(str) {
    return str ? str.slice(0, 1).toLowerCase() + str.slice(1) : "";
}
function stripLeadingSlash(str) {
    return str.slice(0, 1) === "/" ? str.slice(1) : str;
}

var RelationshipPolicy;
(function (RelationshipPolicy) {
    RelationshipPolicy["keys"] = "keys";
    RelationshipPolicy["lazy"] = "lazy";
    RelationshipPolicy["inline"] = "inline";
})(RelationshipPolicy || (RelationshipPolicy = {}));
var RelationshipCardinality;
(function (RelationshipCardinality) {
    RelationshipCardinality["hasMany"] = "hasMany";
    RelationshipCardinality["belongsTo"] = "belongsTo";
})(RelationshipCardinality || (RelationshipCardinality = {}));

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
            ? new Dexie(this._name, { indexedDB: DexieDb._indexedDb })
            : new Dexie(this._name);
        this._db.on("blocked", () => {
            this._status = "blocked";
        });
        this._db.on("populate", () => {
            this._status = "populate";
        });
        this._db.on("ready", () => {
            this._status = "ready";
        });
        models.forEach((m) => {
            const r = Record.create(m);
            this._constructors[r.pluralName] = m;
            this._meta[r.pluralName] = {
                ...r.META,
                modelName: r.modelName,
                hasDynamicPath: r.hasDynamicPath,
                dynamicPathComponents: r.dynamicPathComponents,
                pluralName: r.pluralName,
            };
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
            throw new FireModelError(`A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`, "firemodel/no-models");
        }
        return modelConstructors.reduce((agg, curr) => {
            const dexieModel = [];
            const r = Record.createWith(curr, new curr());
            const compoundIndex = r.hasDynamicPath
                ? ["id"].concat(r.dynamicPathComponents)
                : "";
            if (compoundIndex) {
                dexieModel.push(`[${compoundIndex.join("+")}]`);
            }
            // UNIQUE Indexes
            (r.hasDynamicPath ? [] : ["id"])
                .concat((r.META.dbIndexes || [])
                .filter((i) => i.isUniqueIndex)
                .map((i) => i.property))
                .forEach((i) => dexieModel.push(`&${i}`));
            // NON-UNIQUE Indexes
            const indexes = []
                .concat((r.META.dbIndexes || [])
                .filter((i) => i.isIndex && !i.isUniqueIndex)
                .map((i) => i.property))
                // include dynamic props (if they're not explicitly marked as indexes)
                .concat(r.hasDynamicPath
                ? r.dynamicPathComponents.filter((i) => !r.META.dbIndexes.map((idx) => idx.property).includes(i))
                : [])
                .forEach((i) => dexieModel.push(i));
            // MULTI-LEVEL Indexes
            const multiEntryIndex = []
                .concat(r.META.dbIndexes
                .filter((i) => i.isMultiEntryIndex)
                .map((i) => i.property))
                .forEach((i) => dexieModel.push(`*${i}`));
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
            Dexie.dependencies.IDBKeyRange = idbKeyRange;
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
        return this.db.tables.map((t) => ({
            name: t.name,
            schema: t.schema,
        }));
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
        const r = Record.create(model);
        return this.modelNames.includes(r.modelName);
    }
    /**
     * Returns a typed **Dexie** `Table` object for a given model class
     */
    table(model) {
        const r = Record.create(model);
        if (!this.isOpen()) {
            this.open();
        }
        if (!this.modelIsManagedByDexie(model)) {
            throw new DexieError(`Attempt to get a Dexie.Table for "${capitalize(r.modelName)}" Firemodel model but this model is not being managed by Dexie! Models being managed are: ${this.modelNames.join(", ")}`, "dexie/table-does-not-exist");
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
        const r = Record.create(model);
        if (!this.modelNames.includes(r.modelName)) {
            const isPlural = this.pluralNames.includes(r.modelName);
            throw new DexieError(`Attempt to reach the record API via DexieDb.record("${model}") failed as there is no known Firemodel model of that name. ${isPlural
                ? "It looks like you may have accidentally used the plural name instead"
                : ""}. Known model types are: ${this.modelNames.join(", ")}`, "dexie/model-does-not-exist");
        }
        if (!this.isOpen()) {
            this.open();
        }
        return new DexieRecord(model, this.table(model), this.meta(r.modelName));
    }
    /**
     * Provides a very **Firemodel**-_like_ API surface to interact with LIST based
     * queries.
     *
     * @param model the **Firemodel** `Model` name
     */
    list(model) {
        const r = Record.create(model);
        if (!this.isOpen()) {
            this.open();
        }
        const table = r.hasDynamicPath
            ? this.table(model)
            : this.table(model);
        const meta = this.meta(r.modelName);
        return new DexieList(model, table, meta);
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
            throw new DexieError(`Attempt to call DexieDb.open() failed because the database is already open!`, `dexie/db-already-open`);
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
            throw new DexieError(`Attempt to call DexieDb.close() failed because the database is NOT open!`, `dexie/db-not-open`);
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
        throw new DexieError(`Failed while calling DexieModel.${fn}("${name}") because "${name}" is neither a singular or plural name of a known model!`, `firemodel/invalid-dexie-model`);
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

/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
class DexieList {
    constructor(modelConstructor, table, meta) {
        this.modelConstructor = modelConstructor;
        this.table = table;
        this.meta = meta;
    }
    /**
     * Get a full list of _all_ records of a given model type
     */
    async all(options = {
        orderBy: "lastUpdated",
    }) {
        // TODO: had to remove the `orderBy` for models with a composite key; no idea why!
        const c = this.meta.hasDynamicPath
            ? this.table
            : this.table.orderBy(options.orderBy);
        if (options.limit) {
            c.limit(options.limit);
        }
        if (options.offset) {
            c.offset(options.offset);
        }
        const results = c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`Problem with list(${capitalize(this.meta.modelName)}).all(${JSON.stringify(options)}): ${e.message}`, `dexie/${e.code || e.name || "list.all"}`);
            }
        });
        return results || [];
    }
    /**
     * Limit the list of records based on the evaluation of a single
     * properties value. Default comparison is equality but you can
     * change the `value` to a Tuple and include the `<` or `>` operator
     * as the first param to get other comparison operators.
     */
    async where(prop, value, options = {}) {
        // const c = this.table.orderBy(options.orderBy || "lastUpdated");
        const [op, val] = Array.isArray(value) && ["=", ">", "<"].includes(value[0])
            ? value
            : ["=", value];
        let query = op === "="
            ? this.table.where(prop).equals(val)
            : op === ">"
                ? this.table.where(prop).above(val)
                : this.table.where(prop).below(val);
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.offset(options.offset);
        }
        const results = query.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.where("${prop}", ${JSON.stringify(value)}, ${JSON.stringify(options)}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.where"}`);
            }
        });
        return results || [];
    }
    /**
     * Get the "_x_" most recent records of a given type (based on the
     * `lastUpdated` property).
     */
    async recent(limit, skip) {
        const c = skip
            ? this.table.orderBy("lastUpdated").reverse().limit(limit).offset(skip)
            : this.table.orderBy("lastUpdated").reverse().limit(limit);
        return c.toArray();
    }
    /**
     * Get all records updated since a given timestamp.
     */
    async since(datetime, options = {}) {
        return this.where("lastUpdated", [">", datetime]);
    }
    /**
     * Get the _last_ "x" records which were created.
     */
    async last(limit, skip) {
        const c = skip
            ? this.table.orderBy("createdAt").reverse().limit(limit).offset(skip)
            : this.table.orderBy("createdAt").reverse().limit(limit);
        return c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.last(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.last"}`);
            }
        });
    }
    /**
     * Get the _first_ "x" records which were created (aka, the earliest records created)
     */
    async first(limit, skip) {
        const c = skip
            ? this.table.orderBy("createdAt").limit(limit).offset(skip)
            : this.table.orderBy("createdAt").limit(limit);
        return c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.first(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.first"}`);
            }
        });
    }
}

/**
 * Provides a simple API to do CRUD operations
 * on Dexie/IndexDB which resembles the Firemodel
 * API.
 */
class DexieRecord {
    constructor(modelConstructor, table, meta) {
        this.modelConstructor = modelConstructor;
        this.table = table;
        this.meta = meta;
    }
    /**
     * Gets a specific record from the **IndexDB**; if record is not found the
     * `dexie/record-not-found` error is thrown.
     *
     * @param pk the primary key for the record; which is just the `id` in many cases
     * but becomes a `CompositeKey` if the model has a dynamic path.
     */
    async get(pk) {
        return this.table.get(pk).catch((e) => {
            throw new DexieError(`DexieRecord: problem getting record ${JSON.stringify(pk)} of model ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "get"}`);
        });
    }
    /**
     * Adds a new record of _model_ `T`; if an `id` is provided it is used otherwise
     * it will generate an id using the client-side library 'firebase-key'.
     *
     * @param record the dictionary representing the new record
     */
    async add(record) {
        if (this.meta.hasDynamicPath) {
            if (!this.meta.dynamicPathComponents.every((i) => record[i])) {
                throw new DexieError(`The model ${capitalize(this.meta.modelName)} is based on a dynamic path [ ${this.meta.dynamicPathComponents.join(", ")} ] and every part of this path is therefore a required field but the record hash passed in did not define values for all these properties. The properties which WERE pass in included: ${Object.keys(record).join(", ")}`, "dexie/missing-property");
            }
        }
        if (!record.id) {
            record.id = key();
        }
        const now = new Date().getTime();
        record.createdAt = now;
        record.lastUpdated = now;
        const pk = await this.table
            .add(record)
            .catch((e) => {
            throw new DexieError(`DexieRecord: Problem adding record to ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "add"}`);
        });
        return this.get(pk);
    }
    /**
     * Update an existing record in the **IndexDB**
     */
    async update(pk, updateHash) {
        const now = new Date().getTime();
        updateHash.lastUpdated = now;
        const result = await this.table
            .update(pk, updateHash)
            .catch((e) => {
            throw new DexieError(`DexieRecord: Problem updating ${capitalize(this.meta.modelName)}.${typeof pk === "string" ? pk : pk.id}: ${e.message}`, `dexie/${e.code || e.name || "update"}`);
        });
        if (result === 0) {
            throw new DexieError(`The primary key passed in to record.update(${JSON.stringify(pk)}) was NOT found in the IndexedDB!`, "dexie/record-not-found");
        }
        if (result > 1) {
            throw new DexieError(`While calling record.update(${JSON.stringify(pk)}) MORE than one record was updated!`, "dexie/unexpected-error");
        }
    }
    async remove(id) {
        return this.table.delete(id).catch((e) => {
            throw new DexieError(`Problem removing record ${JSON.stringify(id)} from the ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "remove"}`);
        });
    }
}

const NamedFakes = {
    /** produces an "id" that looks/behaves like a Firebase key */
    id: true,
    /** produces an "id" that looks/behaves like a Firebase key */
    fbKey: true,
    String: true,
    number: true,
    /** alias for "number" */
    Number: true,
    price: true,
    Boolean: true,
    Object: true,
    name: true,
    firstName: true,
    lastName: true,
    /** alias for companyName */
    company: true,
    companyName: true,
    address: true,
    streetAddress: true,
    fullAddress: true,
    city: true,
    state: true,
    zipCode: true,
    stateAbbr: true,
    country: true,
    countryCode: true,
    latitude: true,
    longitude: true,
    coordinate: true,
    gender: true,
    age: true,
    ageChild: true,
    ageAdult: true,
    ageOlder: true,
    jobTitle: true,
    date: true,
    dateRecent: true,
    dateRecentString: true,
    dateMiliseconds: true,
    dateRecentMiliseconds: true,
    datePast: true,
    datePastString: true,
    datePastMiliseconds: true,
    dateFuture: true,
    dateFutureString: true,
    dateFutureMiliseconds: true,
    dateSoon: true,
    dateSoonString: true,
    dateSoonMiliseconds: true,
    imageAvatar: true,
    imageAnimal: true,
    imageNature: true,
    imagePeople: true,
    imageTransport: true,
    phoneNumber: true,
    email: true,
    /** a single word */
    word: true,
    words: true,
    sentence: true,
    paragraph: true,
    paragraphs: true,
    slug: true,
    url: true,
    /** produces a unique id */
    uuid: true,
    random: true,
    sequence: true,
    distribution: true,
    placeImage: true,
    placeHolder: true,
};
// export default NamedFakes;

const PropertyNamePatterns = {
    id: "id",
    name: "name",
    age: "age",
    fullname: "name",
    firstName: "firstName",
    lastName: "lastName",
    address: "address",
    city: "city",
    state: "stateAbbr",
    country: "countryCode",
    street: "streetAddress",
    streetAddress: "streetAddress",
    lat: "latitude",
    latitude: "latitude",
    lon: "longitude",
    longitude: "longitude",
    avatar: "imageAvatar",
    phone: "phoneNumber",
    phoneNumber: "phoneNumber",
};

/**
 * Adds relationships to mocked records
 */
function addRelationships(db, config, exceptions = {}) {
    return async (record) => {
        const relns = record.META.relationships;
        const relnResults = [];
        if (config.relationshipBehavior !== "ignore") {
            for (const rel of relns) {
                if (!config.cardinality ||
                    Object.keys(config.cardinality).includes(rel.property)) {
                    if (rel.relType === "hasOne") {
                        const fkRec = await processHasOne(record, rel, config, db);
                        if (config.relationshipBehavior === "follow") {
                            relnResults.push(fkRec);
                        }
                    }
                    else {
                        const cardinality = config.cardinality
                            ? typeof config.cardinality[rel.property] === "number"
                                ? config.cardinality[rel.property]
                                : NumberBetween(config.cardinality[rel.property])
                            : 2;
                        for (const i of Array(cardinality)) {
                            const fkRec = await processHasMany(record, rel, config, db);
                            if (config.relationshipBehavior === "follow") {
                                relnResults.push(fkRec);
                            }
                        }
                    }
                }
            }
        }
        return [
            {
                id: record.id,
                compositeKey: record.compositeKey,
                modelName: record.modelName,
                pluralName: record.pluralName,
                dbPath: record.dbPath,
                localPath: record.localPath,
            },
            ...relnResults,
        ];
    };
}
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}

const sequence = {};
function getDistribution(...distribution) {
    const num = Math.floor(Math.random() * 100) + 1;
    let start = 1;
    let outcome;
    const d = distribution.map((i) => {
        const [percentage, value] = i;
        const end = start + percentage - 1;
        const val = { start, end, value };
        start = start + percentage;
        return val;
    });
    d.forEach((i) => {
        if (num >= i.start && num <= i.end) {
            outcome = i.value;
            // console.log("set", num, `${start} => ${start + percentage}`);
        }
    });
    if (!outcome) {
        throw new Error(`The mock distribution's random number [ ${num} ] fell outside the range of probability; make sure that your percentages add up to 100 [ ${distribution
            .map((i) => i[0])
            .join(", ")} ]`);
    }
    return outcome;
}
function fakeIt(helper, type, ...rest) {
    function getNumber(numOptions) {
        return numOptions && typeof numOptions === "object"
            ? helper.faker.random.number(numOptions)
            : helper.faker.random.number({ min: 1, max: 100 });
    }
    /** for mocks which use a hash-based second param */
    function options(defaultValue = {}) {
        return rest[0] ? { ...defaultValue, ...rest[0] } : undefined;
    }
    switch (type) {
        case "id":
        case "fbKey":
            return key();
        case "String":
            return helper.faker.lorem.words(5);
        case "number":
        case "Number":
            return getNumber(options({ min: 0, max: 1000 }));
        case "price":
            const price = options({
                symbol: "$",
                min: 1,
                max: 100,
                precision: 2,
                variableCents: false,
            });
            let cents;
            if (price.variableCents) {
                cents = getDistribution([40, "00"], [30, "99"], [30, String(getNumber({ min: 1, max: 98 }))]);
                if (cents.length === 1) {
                    cents = cents + "0";
                }
            }
            const priceAmt = helper.faker.commerce.price(price.min, price.max, price.precision, price.symbol);
            return price.variableCents
                ? priceAmt.replace(".00", "." + cents)
                : priceAmt;
        case "Boolean":
            return Math.random() > 0.49 ? true : false;
        case "Object":
            return {};
        case "name":
            return helper.faker.name.firstName() + " " + helper.faker.name.lastName();
        case "firstName":
            return helper.faker.name.firstName();
        case "lastName":
            return helper.faker.name.lastName();
        case "company":
        case "companyName":
            return helper.faker.company.companyName();
        case "address":
            return (helper.faker.address.secondaryAddress() +
                ", " +
                helper.faker.address.city() +
                ", " +
                helper.faker.address.stateAbbr() +
                "  " +
                helper.faker.address.zipCode());
        case "streetAddress":
            return helper.faker.address.streetAddress(false);
        case "fullAddress":
            return helper.faker.address.streetAddress(true);
        case "city":
            return helper.faker.address.city();
        case "state":
            return helper.faker.address.state();
        case "zipCode":
            return helper.faker.address.zipCode();
        case "stateAbbr":
            return helper.faker.address.stateAbbr();
        case "country":
            return helper.faker.address.country();
        case "countryCode":
            return helper.faker.address.countryCode();
        case "latitude":
            return helper.faker.address.latitude();
        case "longitude":
            return helper.faker.address.longitude();
        case "coordinate":
            return {
                latitude: Number(helper.faker.address.latitude()),
                longitude: Number(helper.faker.address.longitude()),
            };
        /**
         * Adds a gender of "male", "female" or "other" but with more likelihood of
         * male or female.
         */
        case "gender":
            return helper.faker.helpers.shuffle([
                "male",
                "female",
                "male",
                "female",
                "male",
                "female",
                "other",
            ]);
        case "age":
            return helper.faker.random.number({ min: 1, max: 99 });
        case "ageChild":
            return helper.faker.random.number({ min: 1, max: 10 });
        case "ageAdult":
            return helper.faker.random.number({ min: 21, max: 99 });
        case "ageOlder":
            return helper.faker.random.number({ min: 60, max: 99 });
        case "jobTitle":
            return helper.faker.name.jobTitle;
        case "date":
        case "dateRecent":
            return helper.faker.date.recent();
        case "dateRecentString":
            return format(helper.faker.date.recent(), "yyyy-MM-dd");
        case "dateMiliseconds":
        case "dateRecentMiliseconds":
            return helper.faker.date.recent().getTime();
        case "datePast":
            return helper.faker.date.past();
        case "datePastString":
            return format(helper.faker.date.past(), "yyyy-MM-dd");
        case "datePastMiliseconds":
            return helper.faker.date.past().getTime();
        case "dateFuture":
            return helper.faker.date.future();
        /** returns string based date in format of "YYYY-MM-DD" */
        case "dateFutureString":
            return format(helper.faker.date.future(), "yyyy-MM-dd");
        case "dateFutureMiliseconds":
            return helper.faker.date.future().getTime();
        case "dateSoon":
            return helper.faker.date.between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1000));
        case "dateSoonString":
            return format(helper.faker.date.between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1000)), "yyyy-MM-dd");
        case "dateSoonMiliseconds":
            return helper.faker.date
                .between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1000))
                .getTime();
        case "imageAvatar":
            return helper.faker.image.avatar();
        case "imageAnimal":
            return helper.faker.image.animals();
        case "imagePeople":
            return helper.faker.image.people();
        case "imageNature":
            return helper.faker.image.nature();
        case "imageTransport":
            return helper.faker.image.transport();
        case "phoneNumber":
            return helper.faker.phone.phoneNumber();
        case "email":
            return helper.faker.internet.email;
        case "word":
            return helper.faker.lorem.word();
        case "words":
            return helper.faker.lorem.words();
        case "sentence":
            return helper.faker.lorem.sentence();
        case "slug":
            return helper.faker.lorem.slug();
        case "paragraph":
            return helper.faker.lorem.paragraph();
        case "paragraphs":
            return helper.faker.lorem.paragraphs();
        case "url":
            return helper.faker.internet.url();
        case "uuid":
            return helper.faker.random.uuid();
        case "random":
            return helper.faker.random.arrayElement(rest);
        case "distribution":
            return getDistribution(...rest);
        case "sequence":
            const prop = helper.context.property;
            const items = rest;
            if (typeof sequence[prop] === "undefined") {
                sequence[prop] = 0;
            }
            else {
                if (sequence[prop] >= items.length - 1) {
                    sequence[prop] = 0;
                }
                else {
                    sequence[prop]++;
                }
            }
            return items[sequence[prop]];
        case "placeImage":
            // TODO: determine why data structure is an array of arrays
            const [width, height, imgType] = rest;
            return `https://placeimg.com/${width}/${height}/${imgType ? imgType : "all"}`;
        case "placeHolder":
            const [size, backgroundColor, textColor] = rest;
            let url = `https://via.placeholder.com/${size}`;
            if (backgroundColor) {
                url += `/${backgroundColor}`;
                if (textColor) {
                    url += `/${textColor}`;
                }
            }
            return url;
        default:
            return helper.faker.lorem.slug();
    }
}

let mockPrepared = false;
function FiremodelMockApi(db, modelConstructor) {
    const config = {
        relationshipBehavior: "ignore",
        exceptionPassthrough: false,
    };
    const MockApi = {
        /**
         * generate
         *
         * Populates the mock database with values for a given model passed in.
         *
         * @param count how many instances of the given Model do you want?
         * @param exceptions do you want to fix a given set of properties to a static value?
         */
        async generate(count, exceptions = {}) {
            if (!mockPrepared) {
                await Mock$1.prepare();
                mockPrepared = true;
            }
            const props = mockProperties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            // create record; using any incoming exception to build the object.
            // this is primarily to form the "composite key" where it is needed
            const record = Record.createWith(modelConstructor, exceptions, { db: this.db });
            if (record.hasDynamicPath) {
                // which props -- required for compositeKey -- are not yet
                // set
                const notCovered = record.dynamicPathComponents.filter((key) => !Object.keys(exceptions).includes(key));
                // for now we are stating that these two mock-types can
                // be used to dig us out of this deficit; we should
                // consider openning this up
                // TODO: consider opening up other mockTypes to fill in the compositeKey
                const validMocks = ["sequence", "random", "distribution"];
                notCovered.forEach((key) => {
                    const prop = record.META.property(key) || {};
                    const mock = prop.mockType;
                    if (!mock ||
                        (typeof mock !== "function" && !validMocks.includes(mock))) {
                        throw new FireModelError(`The mock for the "${record.modelName}" model has dynamic segments and "${key}" was neither set as a fixed value in the exception parameter [ ${Object.keys(exceptions || {})} ] of generate() nor was the model constrained by a @mock type ${mock ? `[ ${mock} ]` : ""} which is deemed valid. Valid named mocks are ${JSON.stringify(validMocks)}; all bespoke mocks are accepted as valid.`, `firemodel/mock-not-ready`);
                    }
                });
            }
            let mocks = [];
            for (const i of Array(count)) {
                mocks = mocks.concat(await relns(await props(record)));
            }
            return mocks;
        },
        /**
         * createRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            return MockApi;
        },
        /**
         * Allows variation in how dynamic paths are configured on FK relationships
         */
        dynamicPathBehavior(options) {
            //
            return MockApi;
        },
        /** All overrides for the primary model are passed along to FK's as well */
        overridesPassThrough() {
            config.exceptionPassthrough = true;
            return MockApi;
        },
        /**
         * followRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating; also generates
         * mocks for all the FK links.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        followRelationshipLinks(cardinality) {
            // TODO: would like to move back to ICardinalityConfig<T> when I can figure out why Partial doesn't work
            config.relationshipBehavior = "follow";
            if (cardinality) {
                config.cardinality = cardinality;
            }
            return MockApi;
        },
    };
    return MockApi;
}

/** adds mock values for all the properties on a given model */
function mockProperties(db, config = { relationshipBehavior: "ignore" }, exceptions) {
    return async (record) => {
        const meta = getModelMeta(record);
        const props = meta.properties;
        const recProps = {};
        // set properties on the record with mocks
        const mh = await getMockHelper(db);
        for (const prop of props) {
            const p = prop.property;
            recProps[p] = await mockValue(db, prop, mh);
        }
        // use mocked values but allow exceptions to override
        const finalized = { ...recProps, ...exceptions };
        // write to mock db and retain a reference to same model
        record = await Record.add(record.modelConstructor, finalized, {
            silent: true,
        });
        return record;
    };
}

function mockValue(db, propMeta, mockHelper, ...rest) {
    mockHelper.context = propMeta;
    const { type, mockType, mockParameters } = propMeta;
    if (mockType) {
        // MOCK is defined
        return typeof mockType === "function"
            ? mockType(mockHelper)
            : fakeIt(mockHelper, mockType, ...(mockParameters || []));
    }
    else {
        // MOCK is undefined
        const fakedMockType = (Object.keys(NamedFakes).includes(propMeta.property)
            ? PropertyNamePatterns[propMeta.property]
            : type);
        return fakeIt(mockHelper, fakedMockType, ...(mockParameters || []));
    }
}

async function processHasMany(record, rel, config, db) {
    // by creating a mock we are giving any dynamic path segments
    // an opportunity to be mocked (this is best practice)
    const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
    const prop = rel.property;
    await record.addToRelationship(prop, fkMockMeta.compositeKey);
    if (config.relationshipBehavior === "link") {
        await db.remove(fkMockMeta.dbPath);
        return;
    }
    return fkMockMeta;
}

async function processHasOne(source, rel, config, db) {
    const fkMock = Mock(rel.fkConstructor(), db);
    const fkMockMeta = (await fkMock.generate(1)).pop();
    const prop = rel.property;
    source.setRelationship(prop, fkMockMeta.compositeKey);
    if (config.relationshipBehavior === "link") {
        const predecessors = fkMockMeta.dbPath
            .replace(fkMockMeta.id, "")
            .split("/")
            .filter((i) => i);
        await db.remove(fkMockMeta.dbPath);
    }
    return fkMockMeta;
}

/**
 * A helper method when designing relationships. In most cases when you
 * state a "inverse property" it means that the two entities can be
 * bi-directionly managed. If, however, you either don't want them to be
 * or in some cases the relationship can be "lossy" and automatic bi-directional
 * management is not possible.
 *
 * When you find yourself in this situation you can use this function in the
 * following manner:
```typescript
export default MyModel extends Model {
  @hasMany(Person, OneWay('children')) parent: fk;
}
```
 */
function OneWay(inverseProperty) {
    return [inverseProperty, "one-way"];
}

function constrainedProperty(options = {}) {
    return propertyReflector({
        ...options,
        ...{ isRelationship: false, isProperty: true },
    }, propertiesByModel);
}
/** allows the introduction of a new constraint to the metadata of a property */
function constrain(prop, value) {
    return propertyReflector({ [prop]: value }, propertiesByModel);
}
function desc(value) {
    return propertyReflector({ desc: value }, propertiesByModel);
}
function min(value) {
    return propertyReflector({ min: value }, propertiesByModel);
}
function max(value) {
    return propertyReflector({ max: value }, propertiesByModel);
}
function length(value) {
    return propertyReflector({ length: value }, propertiesByModel);
}
const property = propertyReflector({
    isRelationship: false,
    isProperty: true,
}, propertiesByModel);
const pushKey = propertyReflector({ pushKey: true }, propertiesByModel);

const propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    if (nameValuePairs.isProperty) {
        const meta = {
            ...Reflect.getMetadata(key, target),
            ...{ type: reflect.name },
            ...nameValuePairs,
        };
        Reflect.defineMetadata(key, meta, target);
        addPropertyToModelMeta(target.constructor.name, property, meta);
    }
    if (nameValuePairs.isRelationship) {
        const meta = {
            ...Reflect.getMetadata(key, target),
            ...{ type: reflect.name },
            ...nameValuePairs,
        };
        Reflect.defineMetadata(key, meta, target);
        addRelationshipToModelMeta(target.constructor.name, property, meta);
    }
};
function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter((p) => p.pushKey).map((p) => p.property);
}

// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
function defaultValue(value) {
    return propertyReflector({ defaultValue: value }, propertiesByModel);
}

const encrypt = propertyReflector({ encrypt: true }, propertiesByModel);

function hasMany(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass, inverse) {
    try {
        const fkConstructor = typeof fkClass === "string"
            ? modelNameLookup(fkClass)
            : modelConstructorLookup(fkClass);
        let inverseProperty;
        let directionality;
        if (Array.isArray(inverse)) {
            [inverseProperty, directionality] = inverse;
        }
        else {
            inverseProperty = inverse;
            directionality = inverse ? "bi-directional" : "one-way";
        }
        const payload = {
            isRelationship: true,
            isProperty: false,
            relType: "hasMany",
            directionality,
            fkConstructor,
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return propertyReflector({ ...payload, type: "Object" }, relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem("hasMany", e, { inverse });
    }
}

function belongsTo(
/**
 * either a _string_ representing the Model's class name
 * or a _constructor_ for the Model class.
 *
 * In order to support prior implementations we include the
 * possibility that a user of this API will pass in a _function_
 * to a _constructor_. This approach is now deprecated.
 */
fkClass, inverse) {
    try {
        const fkConstructor = typeof fkClass === "string"
            ? modelNameLookup(fkClass)
            : modelConstructorLookup(fkClass);
        let inverseProperty;
        let directionality;
        if (Array.isArray(inverse)) {
            [inverseProperty, directionality] = inverse;
        }
        else {
            inverseProperty = inverse;
            directionality = inverse ? "bi-directional" : "one-way";
        }
        const payload = {
            isRelationship: true,
            isProperty: false,
            relType: "hasOne",
            directionality,
            fkConstructor,
        };
        if (inverseProperty) {
            payload.inverseProperty = inverseProperty;
        }
        return propertyReflector({ ...payload, type: "String" }, relationshipsByModel);
    }
    catch (e) {
        throw new DecoratorProblem("hasOne", e, { inverse });
    }
}
const ownedBy = belongsTo;
const hasOne = belongsTo;

/** DB Indexes accumlated by index decorators */
const indexesForModel = {};
/**
 * Gets all the db indexes for a given model
 */
function getDbIndexes(modelKlass) {
    const modelName = modelKlass.constructor.name;
    return modelName === "Model"
        ? hashToArray(indexesForModel[modelName])
        : (hashToArray(indexesForModel[modelName]) || []).concat(hashToArray(indexesForModel.Model));
}
const index = propertyReflector({
    isIndex: true,
    isUniqueIndex: false,
}, indexesForModel);
const uniqueIndex = propertyReflector({
    isIndex: true,
    isUniqueIndex: true,
}, indexesForModel);

function mock(value, ...rest) {
    return propertyReflector({ mockType: value, mockParameters: rest }, propertiesByModel);
}

function model(options = {}) {
    let isDirty = false;
    return function decorateModel(target) {
        // Function to add META to the model
        function addMetaProperty() {
            const modelOfObject = new target();
            if (options.audit === undefined) {
                options.audit = false;
            }
            if (!(options.audit === true ||
                options.audit === false ||
                options.audit === "server")) {
                console.log(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
                options.audit = false;
            }
            const meta = {
                ...options,
                ...{ isProperty: isProperty(modelOfObject) },
                ...{ property: getModelProperty(modelOfObject) },
                ...{ properties: getProperties(modelOfObject) },
                ...{ isRelationship: isRelationship(modelOfObject) },
                ...{ relationship: getModelRelationship(modelOfObject) },
                ...{ relationships: getRelationships(modelOfObject) },
                ...{ dbIndexes: getDbIndexes(modelOfObject) },
                ...{ pushKeys: getPushKeys(modelOfObject) },
                ...{ dbOffset: options.dbOffset ? options.dbOffset : "" },
                ...{ audit: options.audit ? options.audit : false },
                ...{ plural: options.plural },
                ...{
                    allProperties: [
                        ...getProperties(modelOfObject).map((p) => p.property),
                        ...getRelationships(modelOfObject).map((p) => p.property),
                    ],
                },
                ...{
                    localPostfix: options.localPostfix === undefined ? "all" : options.localPostfix,
                },
                ...{
                    localModelName: options.localModelName === undefined
                        ? modelOfObject.constructor.name.slice(0, 1).toLowerCase() +
                            modelOfObject.constructor.name.slice(1)
                        : options.localModelName,
                },
                ...{ isDirty },
            };
            addModelMeta(target.constructor.name.toLowerCase(), meta);
            Object.defineProperty(target.prototype, "META", {
                get() {
                    return meta;
                },
                set(prop) {
                    if (typeof prop === "object" && prop.isDirty !== undefined) {
                        isDirty = prop.isDirty;
                    }
                    else {
                        throw new Error("The META properties should only be set with the @model decorator at design time!");
                    }
                },
                configurable: false,
                enumerable: false,
            });
            if (target) {
                // register the constructor so name based lookups will succeed
                modelRegister(target);
            }
            return target;
        }
        // copy prototype so intanceof operator still works
        addMetaProperty.prototype = target.prototype;
        // return new constructor (will override original)
        return addMetaProperty();
    };
}

/**
 * Adds meta data to a given "property" on a model. In this
 * case we mean property to be either a strict property or
 * a relationship.
 *
 * @param context The meta information as a dictionary/hash
 * @param modelRollup a collection object which maintains
 * a dictionary of properties
 */
const propertyReflector = (context = {}, 
/**
 * if you want this to be rollup up as an dictionary by prop;
 * to be exposed in the model (or otherwise)
 */
modelRollup) => (modelKlass, key) => {
    const modelName = modelKlass.constructor.name;
    const reflect = Reflect.getMetadata("design:type", modelKlass, key) || {};
    const meta = {
        ...(Reflect.getMetadata(key, modelKlass) || {}),
        type: lowercase(reflect.name),
        ...context,
        property: key,
    };
    Reflect.defineMetadata(key, meta, modelKlass);
    if (modelRollup) {
        const modelAndProp = modelName + "." + key;
        set(modelRollup, modelAndProp, {
            ...get(modelRollup, modelAndProp),
            ...meta,
        });
    }
};

function isProperty(modelKlass) {
    return (prop) => {
        return getModelProperty(modelKlass)(prop) ? true : false;
    };
}
/** Properties accumlated by propertyDecorators  */
const propertiesByModel = {};
/** allows the addition of meta information to be added to a model's properties */
function addPropertyToModelMeta(modelName, property, meta) {
    if (!propertiesByModel[modelName]) {
        propertiesByModel[modelName] = {};
    }
    // TODO: investigate why we need to genericize to model (from <T>)
    propertiesByModel[modelName][property] = meta;
}
/** lookup meta data for schema properties */
function getModelProperty(model) {
    const className = model.constructor.name;
    const propsForModel = getProperties(model);
    return (prop) => {
        return propsForModel.find((value) => {
            return value.property === prop;
        });
    };
}
/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
function getProperties(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}

const relationshipsByModel = {};
/** allows the addition of meta information to be added to a model's relationships */
function addRelationshipToModelMeta(modelName, property, meta) {
    if (!relationshipsByModel[modelName]) {
        relationshipsByModel[modelName] = {};
    }
    // TODO: investigate why we need to genericize to model (from <T>)
    relationshipsByModel[modelName][property] = meta;
}
function isRelationship(modelKlass) {
    return (prop) => {
        return getModelRelationship(modelKlass)(prop) ? true : false;
    };
}
function getModelRelationship(model) {
    const relnsForModel = getRelationships(model);
    const className = model.constructor.name;
    return (prop) => {
        return relnsForModel.find((value) => {
            return value.property === prop;
        });
    };
}
/**
 * Gets all the relationships for a given model
 */
function getRelationships(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(relationshipsByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(relationshipsByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties;
}

/**
 * An error deriving from the **Dexie** integration with **Firemodel**.
 * Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
class DexieError extends Error {
    constructor(message, classification = "firemodel/dexie") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}

/**
 * Base **Error** for **FireModel**. Takes _message_ and _type/subtype_ as
 * parameters. The code will be the `subtype`; the name is both.
 */
class FireModelError extends Error {
    constructor(message, classification = "firemodel/error") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}

class DynamicPropertiesNotReady extends FireModelError {
    constructor(rec, message) {
        message = message
            ? message
            : `An attempt to interact with the record ${rec.modelName} in a way that requires that the fully composite key be specified. The required parameters for this model to be ready for this are: ${rec.dynamicPathComponents.join(", ")}.`;
        super(message, "firemodel/dynamic-properties-not-ready");
    }
}

class FireModelProxyError extends FireModelError {
    constructor(e, context = "", name = "") {
        super("", !name ? `firemodel/${e.name}` : name);
        this.firemodel = true;
        this.originalError = e;
        this.message = context ? `${context}.\n\n${e.message}.` : e.message;
        this.stack = e.stack;
    }
}

class DecoratorProblem extends FireModelError {
    constructor(decorator, e, context) {
        super("", "firemodel/decorator-problem");
        const errText = typeof e === "string" ? e : e.message;
        this.message = `There was a problem in the "${decorator}" decorator. ${errText}\n${context}`;
    }
}

/**
 * A mocking error originated within FireModel
 */
class MockError extends Error {
    constructor(message, classification = "firemodel/error") {
        super(message);
        this.firemodel = true;
        const parts = classification.split("/");
        const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
        this.name = `${type}/${subType}`;
        this.code = subType;
    }
}

class RecordCrudFailure extends FireModelError {
    constructor(rec, crudAction, transactionId, e) {
        super("", e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`);
        const message = `Attempt to "${crudAction}" "${capitalize(rec.modelName)}::${rec.id}" failed [ ${transactionId} ] ${e ? e.message : "for unknown reasons"}`;
        this.message = message;
        this.stack = e.stack;
    }
}

class DuplicateRelationship extends FireModelError {
    constructor(pk, property, fkId) {
        const fkConstructor = pk.META.relationship("property").fkConstructor();
        const fkModel = new fkConstructor();
        const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
        super(message, "firemodel/duplicate-relationship");
    }
}

class FkDoesNotExist extends FireModelError {
    constructor(pk, property, fkId) {
        // TODO: is this typing right for constructor?
        const fkConstructor = pk.META.relationship("property").fkConstructor();
        const fkModel = new fkConstructor();
        const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" doesn't exist!`;
        super(message, "firemodel/fk-does-not-exist");
    }
}

class MissingReciprocalInverse extends FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-reciprocal-inverse");
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        const pkInverse = rec.META.relationship(property).inverseProperty;
        const fkInverse = (fkRecord.META.relationship(pkInverse) || {})
            .inverseProperty || "undefined";
        const message = `The model "${capitalize(rec.modelName)}" is trying to leverage it's relationship with the model "${capitalize(fkRecord.modelName)}" through the property "${property}" but it appears these two models are in conflict. ${capitalize(rec.modelName)} has been defined to look for an inverse property of "${capitalize(rec.modelName)}.${rec.META.relationship(property).inverseProperty}" but it is missing [ ${fkInverse} ]! Look at your model definitions and make sure this is addressed.`;
        this.message = message;
    }
}

class IncorrectReciprocalInverse extends FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-reciprocal-inverse");
        let message;
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        const fkInverse = fkRecord.META.relationship(inverseProperty);
        if (!fkInverse) {
            const e = new MissingReciprocalInverse(rec, property);
            throw e;
        }
        else {
            const recipricalInverse = fkInverse.inverseProperty;
            message = `The model ${rec.modelName} is trying to leverage it's relationship with ${fkRecord.modelName} but it appears these two models are in conflict! ${rec.modelName} has been defined to look for an inverse property of "${inverseProperty}" but on ${fkRecord.modelName} model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
        }
        this.message = message;
    }
}

/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
class MissingInverseProperty extends FireModelError {
    constructor(rec, property) {
        super("", "firemodel/missing-inverse-property");
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor(), { db: rec.db });
        this.from = capitalize(rec.modelName);
        this.to = capitalize(fkRecord.modelName);
        const pkInverse = rec.META.relationship(property).inverseProperty;
        this.inverseProperty = pkInverse;
        const message = `Missing Inverse Property: the model "${this.from}" has defined a relationship with the "${this.to}" model where the FK property is "${property}" and it states that the "inverse property" is "${pkInverse}" on the ${this.to} model. Unfortunately the ${this.to} model does NOT define a property called "${this.inverseProperty}".`;
        this.message = message;
    }
}

class NotHasManyRelationship extends FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasMany-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
    }
}

class NotHasOneRelationship extends FireModelError {
    constructor(rec, property, method) {
        super("", "firemodel/not-hasOne-reln");
        this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
    }
}

class UnknownRelationshipProblem extends FireModelError {
    constructor(err, rec, property, operation = "n/a", whileDoing) {
        const message = `An unexpected error occurred while working with a "${operation}" operation on ${rec.modelName}::${property}. ${whileDoing
            ? `This error was encounted while working on ${whileDoing}. `
            : ""}The error reported was [${err.name}]: ${err.message}`;
        super(message, "firemodel/unknown-relationship-problem");
        this.stack = err.stack;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

let AuditLog = /** @class */ (() => {
    let AuditLog = class AuditLog extends Model {
    };
    __decorate([
        property,
        index,
        __metadata("design:type", String)
    ], AuditLog.prototype, "modelName", void 0);
    __decorate([
        property,
        index,
        __metadata("design:type", String)
    ], AuditLog.prototype, "modelId", void 0);
    __decorate([
        property,
        __metadata("design:type", Array)
    ], AuditLog.prototype, "changes", void 0);
    __decorate([
        property,
        __metadata("design:type", String)
    ], AuditLog.prototype, "action", void 0);
    AuditLog = __decorate([
        model({ dbOffset: "_auditing" })
    ], AuditLog);
    return AuditLog;
})();

let Model = /** @class */ (() => {
    let Model = class Model {
    };
    __decorate([
        property,
        __metadata("design:type", String)
    ], Model.prototype, "id", void 0);
    __decorate([
        property,
        mock("dateRecentMiliseconds"),
        index,
        __metadata("design:type", Number)
    ], Model.prototype, "lastUpdated", void 0);
    __decorate([
        property,
        mock("datePastMiliseconds"),
        index,
        __metadata("design:type", Number)
    ], Model.prototype, "createdAt", void 0);
    Model = __decorate([
        model()
    ], Model);
    return Model;
})();

/**
 * When creating a new record it is sometimes desirable to pass in
 * the "payload" of FK's instead of just the FK. This function facilitates
 * that.
 */
async function buildDeepRelationshipLinks(rec, property) {
    const meta = getModelMeta(rec).property(property);
    return meta.relType === "hasMany"
        ? processHasMany$1(rec, property)
        : processBelongsTo(rec, property);
}
async function processHasMany$1(rec, property) {
    const meta = getModelMeta(rec).property(property);
    const fks = rec.get(property);
    for (const key of Object.keys(fks)) {
        const fk = fks[key];
        if (fk !== true) {
            const fkRecord = await Record.add(meta.fkConstructor(), fk, {
                setDeepRelationships: true
            });
            await rec.addToRelationship(property, fkRecord.compositeKeyRef);
        }
    }
    // strip out object FK's
    const newFks = Object.keys(rec.get(property)).reduce((foreignKeys, curr) => {
        const fk = fks[curr];
        if (fk !== true) {
            delete foreignKeys[curr];
        }
        return foreignKeys;
    }, {});
    // TODO: maybe there's a better way than writing private property?
    // ambition is to remove the bullshit FKs objects; this record will
    // not have been saved yet so we're just getting it back to a good
    // state before it's saved.
    rec._data[property] = newFks;
    return;
}
async function processBelongsTo(rec, property) {
    const fk = rec.get(property);
    const meta = getModelMeta(rec).property(property);
    if (fk && typeof fk === "object") {
        const fkRecord = Record.add(meta.fkConstructor(), fk, {
            setDeepRelationships: true
        });
    }
}

/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
function createCompositeKey(rec) {
    const model = rec.data;
    if (!rec.id) {
        throw new FireModelError(`You can not create a composite key without first setting the 'id' property!`, "firemodel/not-ready");
    }
    const dynamicPathComponents = rec.dynamicPathComponents.reduce((prev, key) => {
        if (!model[key]) {
            throw new FireModelError(`You can not create a composite key on a ${capitalize(rec.modelName)} without first setting the '${key}' property!`, "firemodel/not-ready");
        }
        return {
            ...prev,
            ...{ [key]: model[key] }
        };
    }, {});
    return rec.dynamicPathComponents.reduce((prev, key) => ({
        ...prev,
        ...dynamicPathComponents
    }), { id: rec.id });
}

function createCompositeKeyFromFkString(fkCompositeRef, modelConstructor) {
    const [id, ...paramsHash] = fkCompositeRef.split("::");
    const model = modelConstructor ? new modelConstructor() : undefined;
    return paramsHash
        .map(i => i.split(":"))
        .reduce((acc, curr) => {
        const [prop, value] = curr;
        acc[prop] = model
            ? setWithType(prop, value, model)
            : value;
        return acc;
    }, { id });
}
function setWithType(prop, value, model) {
    if (!model.META.property(prop)) {
        throw new FireModelError(`When building a "typed" composite key based on the model ${capitalize(model.constructor.name)}, the property "${prop}" was presented but this property doesn't exist on this model!`, "firemodel/property-does-not-exist");
    }
    const type = model.META.property(prop).type;
    switch (type) {
        case "number":
            return Number(value);
        case "boolean":
            return Boolean(value);
        default:
            return value;
    }
}

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
function createCompositeKeyRefFromRecord(rec) {
    const cKey = createCompositeKey(rec);
    return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}
/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
function createCompositeRef(cKey) {
    return Object.keys(cKey).length > 1
        ? cKey.id +
            Object.keys(cKey)
                .filter(k => k !== "id")
                .map(k => `::${k}:${cKey[k]}`)
        : cKey.id;
}

function extractFksFromPaths(rec, prop, paths) {
    const pathToModel = rec.dbPath;
    const relnType = rec.META.relationship(prop).relType;
    return paths.reduce((acc, p) => {
        const fkProp = pathJoin$1(pathToModel, prop);
        if (p.path.includes(fkProp)) {
            const parts = p.path.split("/");
            const fkId = relnType === "hasOne" ? p.value : parts.pop();
            acc = acc.concat(fkId);
        }
        return acc;
    }, []);
}

/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 *
 * This function has no concern with dispatch or the FK model
 * and any updates that may need to take place there.
 */
function locallyUpdateFkOnRecord(rec, fkId, event) {
    const relnType = rec.META.relationship(event.property).relType;
    // update lastUpdated but quietly as it will be updated again
    // once server responds
    rec.set("lastUpdated", new Date().getTime(), true);
    // now work on a per-op basis
    switch (event.operation) {
        case "set":
        case "add":
            rec._data[event.property] =
                relnType === "hasMany"
                    ? { ...rec.data[event.property], ...{ [fkId]: true } }
                    : fkId;
            return;
        case "remove":
            if (relnType === "hasMany") {
                delete rec._data[event.property][fkId];
            }
            else {
                rec._data[event.property] = "";
            }
            return;
    }
}

/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
function reduceCompositeNotationToStringRepresentation(ck) {
    return (`${ck.id}` +
        Object.keys(ck)
            .filter(k => k !== "id")
            .map(k => `::${k}:${ck[k]}`));
}

function discoverRootPath(results) {
    try {
        const incomingPaths = results.map(i => i.path);
        const rootParts = incomingPaths.reduce((acc, curr) => {
            let i = 0;
            while (i < acc.length &&
                curr
                    .split("/")
                    .slice(0, i)
                    .join("/") === acc.slice(0, i).join("/")) {
                i++;
            }
            return i === 1 ? [] : acc.slice(0, i - 1);
        }, incomingPaths[0].split("/"));
        const root = rootParts.join("/");
        const paths = results.reduce((acc, curr) => {
            acc = acc.concat({
                path: curr.path.replace(root, ""),
                value: curr.value
            });
            return acc;
        }, []);
        return {
            paths,
            root,
            fullPathNames: Object.keys(results)
        };
    }
    catch (e) {
        if (e.firemodel) {
            throw e;
        }
        else {
            throw new FireModelProxyError(e, "Problems in discoverRootPath");
        }
    }
}

/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
 */
async function relationshipOperation(rec, 
/**
 * **operation**
 *
 * The relationship operation that is being executed
 */
operation, 
/**
 * **property**
 *
 * The property on this model which changing its relationship status in some way
 */
property, 
/**
 * The array of _foreign keys_ (of the "from" model) which will be operated on
 */
fkRefs, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths, options = {}) {
    // make sure all FK's are strings
    const fks = fkRefs.map((fk) => {
        return typeof fk === "object" ? createCompositeRef(fk) : fk;
    });
    const dispatchEvents = {
        set: [
            FmEvents.RELATIONSHIP_SET_LOCALLY,
            FmEvents.RELATIONSHIP_SET_CONFIRMATION,
            FmEvents.RELATIONSHIP_SET_ROLLBACK,
        ],
        clear: [
            FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
        ],
        // update: [
        //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
        //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
        //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
        // ],
        add: [
            FmEvents.RELATIONSHIP_ADDED_LOCALLY,
            FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
            FmEvents.RELATIONSHIP_ADDED_ROLLBACK,
        ],
        remove: [
            FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
        ],
    };
    try {
        const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
        const fkConstructor = rec.META.relationship(property).fkConstructor;
        // TODO: fix the typing here to make sure fkConstructor knows it's type
        const fkRecord = new Record(fkConstructor());
        const fkMeta = getModelMeta(fkRecord.data);
        const transactionId = "t-reln-" +
            Math.random().toString(36).substr(2, 5) +
            "-" +
            Math.random().toString(36).substr(2, 5);
        const event = {
            key: rec.compositeKeyRef,
            operation,
            property,
            kind: "relationship",
            eventType: "local",
            transactionId,
            fks,
            paths,
            from: capitalize(rec.modelName),
            to: capitalize(fkRecord.modelName),
            fromLocal: rec.localPath,
            toLocal: fkRecord.localPath,
            fromConstructor: rec.modelConstructor,
            toConstructor: fkRecord.modelConstructor,
        };
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        if (inverseProperty) {
            event.inverseProperty = inverseProperty;
        }
        try {
            await localRelnOp(rec, event, localEvent);
            await relnConfirmation(rec, event, confirmEvent);
        }
        catch (e) {
            await relnRollback(rec, event, rollbackEvent);
            throw new FireModelProxyError(e, `Encountered an error executing a relationship operation between the "${event.from}" model and "${event.to}". The paths that were being modified were: ${event.paths
                .map((i) => i.path)
                .join("- \n")}\n A dispatch for a rollback event has been issued.`);
        }
    }
    catch (e) {
        if (e.firemodel) {
            throw e;
        }
        else {
            throw new UnknownRelationshipProblem(e, rec, property, operation);
        }
    }
}
async function localRelnOp(rec, event, type) {
    try {
        // locally modify Record's values
        // const ids = extractFksFromPaths(rec, event.property, event.paths);
        event.fks.map((fk) => {
            locallyUpdateFkOnRecord(rec, fk, { ...event, type });
        });
        // local optimistic dispatch
        rec.dispatch({ ...event, type });
        const ref = rec.db.ref("/");
        // TODO: replace with multiPathSet/transaction
        await ref.update(event.paths.reduce((acc, curr) => {
            acc[curr.path] = curr.value;
            return acc;
        }, {}));
    }
    catch (e) {
        throw new FireModelProxyError(e, `While operating doing a local relationship operation ran into an error. Note that the "paths" passed in were:\n${JSON.stringify(event.paths)}.\n\nThe underlying error message was:`);
    }
}
async function relnConfirmation(rec, event, type) {
    rec.dispatch({ ...event, type });
}
async function relnRollback(rec, event, type) {
    //
    /**
     * no writes will have actually been done to DB but
     * front end framework will need to know as it probably
     * adjusted _optimistically_
     */
    rec.dispatch({ ...event, type });
}

/**
 * Builds all the DB paths needed to update a pairing of a PK:FK. It is intended
 * to be used by the `Record`'s transactional API as a first step of specifying
 * the FULL atomic transaction that will be executed as a "multi-path set" on
 * Firebase.
 *
 * If the operation requires the removal o relationship then set this in the
 * optional hash.
 *
 * @param rec the `Record` which holds the FK reference to an external entity
 * @param property the _property_ on the `Record` which holds the FK id
 * @param fkRef the "id" for the FK which is being worked on
 */
function buildRelationshipPaths(rec, property, fkRef, options = {}) {
    try {
        const meta = getModelMeta(rec);
        const now = options.now || new Date().getTime();
        const operation = options.operation || "add";
        const altHasManyValue = options.altHasManyValue || true;
        const fkModelConstructor = meta.relationship(property).fkConstructor();
        const inverseProperty = meta.relationship(property).inverseProperty;
        const fkRecord = Record.createWith(fkModelConstructor, fkRef, { db: rec.db });
        const results = [];
        /**
         * Normalize to a composite key format
         */
        const fkCompositeKey = typeof fkRef === "object" ? fkRef : fkRecord.compositeKey;
        const fkId = createCompositeKeyRefFromRecord(fkRecord);
        /**
         * boolean flag indicating whether current model has a **hasMany** relationship
         * with the FK.
         */
        const hasManyReln = meta.isRelationship(property) &&
            meta.relationship(property).relType === "hasMany";
        const pathToRecordsFkReln = pathJoin$1(rec.dbPath, // this includes dynamic segments for originating model
        property, 
        // we must add the fk id to path (versus value) to make the write non-destructive
        // to other hasMany keys which already exist
        hasManyReln ? fkId : "");
        // Add paths for current record
        results.push({
            path: pathToRecordsFkReln,
            value: operation === "remove" ? null : hasManyReln ? altHasManyValue : fkId
        });
        results.push({ path: pathJoin$1(rec.dbPath, "lastUpdated"), value: now });
        // INVERSE RELATIONSHIP
        if (inverseProperty) {
            const fkMeta = getModelMeta(fkRecord);
            const inverseReln = fkMeta.relationship(inverseProperty);
            if (!inverseReln) {
                throw new MissingInverseProperty(rec, property);
            }
            if (!inverseReln.inverseProperty &&
                inverseReln.directionality === "bi-directional") {
                throw new MissingReciprocalInverse(rec, property);
            }
            if (inverseReln.inverseProperty !== property &&
                inverseReln.directionality === "bi-directional") {
                throw new IncorrectReciprocalInverse(rec, property);
            }
            const fkInverseIsHasManyReln = inverseProperty
                ? fkMeta.relationship(inverseProperty).relType === "hasMany"
                : false;
            const pathToInverseFkReln = fkInverseIsHasManyReln
                ? pathJoin$1(fkRecord.dbPath, inverseProperty, rec.compositeKeyRef)
                : pathJoin$1(fkRecord.dbPath, inverseProperty);
            // Inverse paths
            results.push({
                path: pathToInverseFkReln,
                value: operation === "remove"
                    ? null
                    : fkInverseIsHasManyReln
                        ? altHasManyValue
                        : rec.compositeKeyRef
            });
            results.push({
                path: pathJoin$1(fkRecord.dbPath, "lastUpdated"),
                value: now
            });
        }
        // TODO: add validation of FK paths if option is set
        return results;
    }
    catch (e) {
        if (e.firemodel) {
            console.log(e);
            throw e;
        }
        throw new UnknownRelationshipProblem(e, rec, property);
    }
}

const registeredModels = {};
/**
 * Registered a model's constructor so that it can be used by name. This
 * is sometime necessary due to circular dependencies.
 *
 * @param model a class constructor derived from `Model`
 */
function modelRegister(...models) {
    models.forEach(model => {
        if (!model) {
            throw new FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was undefined!${models.length > 0
                ? ` [ ${models.length} models being registed during this call ]`
                : ""}`, "firemodel/not-allowed");
        }
        if (typeof model !== "function" || !model.constructor) {
            throw new FireModelError(`An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model} ]!\nmodel passed was: ${model}`, "firemodel/not-allowed");
        }
        const modelName = new model().constructor.name;
        registeredModels[modelName] = model;
    });
}
function listRegisteredModels() {
    return Object.keys(registeredModels);
}
function modelRegistryLookup(name) {
    const model = registeredModels[name];
    if (!name) {
        throw new FireModelError(`Look failed because the model ${name} was not registered!`, "firemodel/not-allowed");
    }
    return model;
}
/**
 * When you are building relationships to other `Model`'s it is often
 * benefitial to just pass in the name of the `Model` rather than it's
 * constructor as this avoids the dreaded "circular dependency" problem
 * that occur when you try to pass in class constructors which depend
 * on one another.
 */
const modelNameLookup = (name) => () => {
    return modelRegistryLookup(name);
};
/**
 * When you are defining a _relationship_ between `Model`'s it sometimes
 * useful to just pass in the constructor to the other `Model`. This is in
 * contrast to just passing a string name of the model.
 *
 * The advantage here is that the external model does not need to be
 * "registered" separately whereas with a string name it would have to be.
 */
const modelConstructorLookup = (constructor) => () => {
    // TODO: remove the "any"
    return isConstructable(constructor) ? constructor : constructor();
};
// tslint:disable-next-line: ban-types
function isConstructable(fn) {
    try {
        const f = new fn();
        return true;
    }
    catch (e) {
        return false;
    }
}

function UnwatchedLocalEvent(rec, event) {
    const meta = {
        dynamicPathProperties: rec.dynamicPathComponents,
        compositeKey: rec.compositeKey,
        modelConstructor: rec.modelConstructor,
        modelName: rec.modelName,
        pluralName: rec.pluralName,
        localModelName: rec.META.localModelName,
        localPath: rec.localPath,
        localPostfix: rec.META.localPostfix,
    };
    return { ...event, ...meta, dbPath: rec.dbPath, watcherSource: "unknown" };
}

/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
function VeuxWrapper(vuexDispatch) {
    /** vuex wrapped redux dispatch function */
    return async (reduxAction) => {
        const type = reduxAction.type;
        delete reduxAction.type;
        return vuexDispatch(type, reduxAction);
    };
}

/** Enumeration of all Firemodel Actions that will be fired */
var FmEvents;
(function (FmEvents) {
    /** A record has been added locally */
    FmEvents["RECORD_ADDED_LOCALLY"] = "@firemodel/RECORD_ADDED_LOCALLY";
    /** A record which was added locally has now been confirmed by Firebase */
    FmEvents["RECORD_ADDED_CONFIRMATION"] = "@firemodel/RECORD_ADDED_CONFIRMATION";
    /** A record added locally failed to be saved to Firebase */
    FmEvents["RECORD_ADDED_ROLLBACK"] = "@firemodel/RECORD_ADDED_ROLLBACK";
    /** A record has been added to a given Model list being watched (external event) */
    FmEvents["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    /** A record has been updated locally */
    FmEvents["RECORD_CHANGED_LOCALLY"] = "@firemodel/RECORD_CHANGED_LOCALLY";
    /** a record changed locally has now been confirmed by Firebase */
    FmEvents["RECORD_CHANGED_CONFIRMATION"] = "@firemodel/RECORD_CHANGED_CONFIRMATION";
    /** A record changed locally failed to be saved to Firebase */
    FmEvents["RECORD_CHANGED_ROLLBACK"] = "@firemodel/RECORD_CHANGED_ROLLBACK";
    /** A record has been updated on Firebase (external event) */
    FmEvents["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    /**
     * for client originated events touching relationships (as external events would come back as an event per model)
     */
    FmEvents["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    /** A record has been removed from a given Model list being watched */
    FmEvents["RECORD_REMOVED_LOCALLY"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** a record removed locally has now been confirmed by Firebase */
    FmEvents["RECORD_REMOVED_CONFIRMATION"] = "@firemodel/RECORD_REMOVED_CONFIRMATION";
    /** A record removed locally failed to be saved to Firebase */
    FmEvents["RECORD_REMOVED_ROLLBACK"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** A record has been removed from a given Model list being watched */
    FmEvents["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** An attempt to access the database was refused to lack of permissions */
    FmEvents["PERMISSION_DENIED"] = "@firemodel/PERMISSION_DENIED";
    /** The optimistic local change now needs to be rolled back due to failure in Firebase */
    FmEvents["RECORD_LOCAL_ROLLBACK"] = "@firemodel/RECORD_LOCAL_ROLLBACK";
    /** Indicates that a given model's "since" property has been updated */
    FmEvents["SINCE_UPDATED"] = "@firemodel/SINCE_UPDATED";
    /** Watcher has started request to watch; waiting for initial SYNC event */
    FmEvents["WATCHER_STARTING"] = "@firemodel/WATCHER_STARTING";
    /** Watcher has established connection with Firebase */
    FmEvents["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
    /**
     * The watcher started with "largePayload" will send a sync event with the
     * whole payload so data synchronization can happen in one mutation
     */
    FmEvents["WATCHER_SYNC"] = "@firemodel/WATCHER_SYNC";
    /** Watcher failed to start */
    FmEvents["WATCHER_FAILED"] = "@firemodel/WATCHER_FAILED";
    /** Watcher has disconnected an event stream from Firebase */
    FmEvents["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
    /** Watcher has disconnected all event streams from Firebase */
    FmEvents["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
    /** Relationship(s) have been removed locally */
    FmEvents["RELATIONSHIP_REMOVED_LOCALLY"] = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY";
    /** Relationship removal has been confirmed by database */
    FmEvents["RELATIONSHIP_REMOVED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_REMOVED_CONFIRMATION";
    /** Relationship removal failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_REMOVED_ROLLBACK"] = "@firemodel/RELATIONSHIP_REMOVED_ROLLBACK";
    /** Relationship has been added locally */
    FmEvents["RELATIONSHIP_ADDED_LOCALLY"] = "@firemodel/RELATIONSHIP_ADDED_LOCALLY";
    /** Relationship add has been confirmed by database */
    FmEvents["RELATIONSHIP_ADDED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_ADDED_CONFIRMATION";
    /** Relationship add failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_ADDED_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
    /** Relationship has been set locally (relating to a hasOne event) */
    FmEvents["RELATIONSHIP_SET_LOCALLY"] = "@firemodel/RELATIONSHIP_SET_LOCALLY";
    /** Relationship set has been confirmed by database */
    FmEvents["RELATIONSHIP_SET_CONFIRMATION"] = "@firemodel/RELATIONSHIP_SET_CONFIRMATION";
    /** Relationship set failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_SET_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
    /** A relationship was "added" but it already existed; this is typically non-action oriented */
    FmEvents["RELATIONSHIP_DUPLICATE_ADD"] = "@firemodel/RELATIONSHIP_DUPLICATE_ADD";
    FmEvents["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
    FmEvents["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
    FmEvents["UNEXPECTED_ERROR"] = "@firemodel/UNEXPECTED_ERROR";
})(FmEvents || (FmEvents = {}));

function isHasManyRelationship(rec, property) {
    return rec.META.relationship(property).relType === "hasMany" ? true : false;
}

/**
 * The base class which both `WatchList` and `WatchRecord` derive.
 */
class WatchBase {
    constructor() {
        /**
         * this is only to accomodate the list watcher using `ids` which is an aggregate of
         * `record` watchers.
         */
        this._underlyingRecordWatchers = [];
    }
    /**
     * **start**
     *
     * executes the watcher (`WatchList` or `WatchRecord`) so that it becomes
     * actively watched
     */
    async start(options = {}) {
        const isListOfRecords = this._watcherSource === "list-of-records";
        const watchIdPrefix = isListOfRecords ? "wlr" : "w";
        let watchHashCode;
        try {
            watchHashCode = isListOfRecords
                ? String(this._underlyingRecordWatchers[0]._query.hashCode())
                : String(this._query.hashCode());
        }
        catch (e) {
            throw new FireModelProxyError(e, `An error occured trying to start a watcher. The source was "${this._watcherSource}" and had a query of: ${this._query}\n\nThe underlying error was: ${e.message}`, "watcher/not-allowed");
        }
        const watcherId = watchIdPrefix + "-" + watchHashCode;
        this._watcherName = options.name || `${watcherId}`;
        const watcherName = options.name || this._watcherName || `${watcherId}`;
        const watcherItem = this.buildWatcherItem(watcherName);
        // The dispatcher will now have all the context it needs to publish events
        // in a consistent fashion; this dispatch function will be used both by
        // both locally originated events AND server based events.
        const dispatch = WatchDispatcher(watcherItem.dispatch)(watcherItem);
        if (!this.db) {
            throw new FireModelError(`Attempt to start a watcher before the database connection has been established!`);
        }
        try {
            if (this._eventType === "value") {
                if (this._watcherSource === "list-of-records") {
                    // Watch all "ids" added to the list of records
                    this._underlyingRecordWatchers.forEach((r) => {
                        this.db.watch(r._query, ["value"], dispatch);
                    });
                }
                else {
                    this.db.watch(this._query, ["value"], dispatch);
                }
            }
            else {
                if (options.largePayload) {
                    const payload = await List.fromQuery(this._modelConstructor, this._query, { offsets: this._options.offsets || {} });
                    await dispatch({
                        type: FmEvents.WATCHER_SYNC,
                        kind: "watcher",
                        modelConstructor: this._modelConstructor,
                        key: this._query.path.split("/").pop(),
                        value: payload.data,
                        offsets: this._options.offsets || {},
                    });
                }
                this.db.watch(this._query, ["child_added", "child_changed", "child_moved", "child_removed"], dispatch);
            }
        }
        catch (e) {
            console.log(`Problem starting watcher [${watcherId}]: `, e);
            (this._dispatcher || FireModel.dispatch)({
                type: FmEvents.WATCHER_FAILED,
                errorMessage: e.message,
                errorCode: e.code || e.name || "firemodel/watcher-failed",
            });
            throw e;
        }
        try {
            addToWatcherPool(watcherItem);
            // dispatch "starting"; no need to wait for promise
            (this._dispatcher || FireModel.dispatch)({
                type: FmEvents.WATCHER_STARTING,
                ...watcherItem,
            });
            await waitForInitialization(watcherItem);
            // console.log("watcher initialized", watcherItem);
            await (this._dispatcher || FireModel.dispatch)({
                type: FmEvents.WATCHER_STARTED,
                ...watcherItem,
            });
            return watcherItem;
        }
        catch (e) {
            throw new FireModelError(`The watcher "${watcherId}" failed to initialize`, "firemodel/watcher-initialization");
        }
    }
    /**
     * **dispatch**
     *
     * allows you to state an explicit dispatch function which will be called
     * when this watcher detects a change; by default it will use the "default dispatch"
     * set on FireModel.dispatch.
     */
    dispatch(d) {
        this._dispatcher = d;
        return this;
    }
    toString() {
        return `Watching path "${this._query.path}" for "${this._eventType}" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
    }
    /**
     * Allows you to use the properties of the watcher to build a
     * `watcherContext` dictionary; this is intended to be used as
     * part of the initialization of the `dispatch` function for
     * local state management.
     *
     * **Note:** that while used here as part of the `start()` method
     * it is also used externally by locally triggered events as well
     */
    buildWatcherItem(name) {
        const dispatch = this.getCoreDispatch();
        const isListOfRecords = this._watcherSource === "list-of-records";
        const watchIdPrefix = isListOfRecords ? "wlr" : "w";
        const watchHashCode = isListOfRecords
            ? String(this._underlyingRecordWatchers[0]._query.hashCode())
            : String(this._query.hashCode());
        const watcherId = watchIdPrefix + "-" + watchHashCode;
        const watcherName = name || `${watcherId}`;
        const eventFamily = this._watcherSource === "list" ? "child" : "value";
        const watcherPaths = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map((i) => i._query.path)
            : [this._query.path];
        // TODO: fix this bullshit typing; should be: SerializedQuery<T> | Array<SerializedQuery<T>>
        const query = this._watcherSource === "list-of-records"
            ? this._underlyingRecordWatchers.map((i) => i._query)
            : this._query;
        const watchContext = {
            watcherId,
            watcherName,
            eventFamily,
            dispatch,
            modelConstructor: this._modelConstructor,
            query,
            dynamicPathProperties: this._dynamicProperties,
            compositeKey: this._compositeKey,
            localPath: this._localPath,
            localPostfix: this._localPostfix,
            modelName: this._modelName,
            localModelName: this._localModelName || "not-relevant",
            pluralName: this._pluralName,
            watcherPaths,
            // TODO: Fix this typing ... the error is nonsensical atm
            watcherSource: this._watcherSource,
            createdAt: new Date().getTime(),
        };
        return watchContext;
    }
    getCoreDispatch() {
        // Use the bespoke dispatcher for this class if it's available;
        // if not then fall back to the default Firemodel dispatch
        const coreDispatch = this._dispatcher || FireModel.dispatch;
        if (coreDispatch.name === "defaultDispatch") {
            throw new FireModelError(`Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`, `firemodel/invalid-dispatch`);
        }
        return coreDispatch;
    }
    get db() {
        if (!this._db) {
            if (FireModel.defaultDb) {
                this._db = FireModel.defaultDb;
            }
        }
        return this._db;
    }
}

/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
const WatchDispatcher = (
/**
 * a base/generic redux dispatch function; typically provided
 * by the frontend state management framework
 */
coreDispatchFn) => (
/** context provided by the watcher at the time in which the watcher was setup */
watcherContext) => {
    if (typeof coreDispatchFn !== "function") {
        throw new FireModelError(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
    }
    // Handle incoming events ...
    return async (event) => {
        const typeLookup = {
            child_added: FmEvents.RECORD_ADDED,
            child_removed: FmEvents.RECORD_REMOVED,
            child_changed: FmEvents.RECORD_CHANGED,
            child_moved: FmEvents.RECORD_MOVED,
            value: FmEvents.RECORD_CHANGED,
        };
        let eventContext;
        let errorMessage;
        if (event.kind === "relationship") {
            eventContext = {
                type: event.type,
                dbPath: "not-relevant, use toLocal and fromLocal",
            };
        }
        else if (event.kind === "watcher") ;
        else {
            // in the case of a watcher list-of records; when the database has no
            // records yet there is no way to fulfill the dynamic path segments without
            // reaching into the watcher context
            if (watcherContext.watcherPaths) {
                const fullPath = watcherContext.watcherPaths.find((i) => i.includes(event.key));
                const compositeKey = Record.getCompositeKeyFromPath(watcherContext.modelConstructor, fullPath);
                event.value = { ...(event.value || {}), ...compositeKey };
            }
            // record events (both server and local)
            const recordProps = typeof event.value === "object"
                ? { id: event.key, ...event.value }
                : { id: event.key };
            const rec = Record.createWith(watcherContext.modelConstructor, recordProps);
            let type;
            switch (event.kind) {
                case "record":
                    type = event.type;
                    break;
                case "server-event":
                    type =
                        event.value === null
                            ? FmEvents.RECORD_REMOVED
                            : typeLookup[event.eventType];
                    break;
                default:
                    type = FmEvents.UNEXPECTED_ERROR;
                    errorMessage = `The "kind" of event was not recognized [ ${event.kind} ]`;
            }
            eventContext = {
                type,
                dbPath: rec.dbPath,
            };
        }
        const reduxAction = {
            ...watcherContext,
            ...event,
            ...eventContext,
        };
        const results = await coreDispatchFn(reduxAction);
        // The mock server and client are now in sync
        hasInitialized(watcherContext.watcherId);
        return results;
    };
};

class WatchList extends WatchBase {
    constructor() {
        super(...arguments);
        this._offsets = {};
        this._options = {};
    }
    static list(
    /**
     * The `Model` underlying the **List**
     */
    modelConstructor, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    options = {}) {
        const obj = new WatchList();
        obj.list(modelConstructor, options);
        return obj;
    }
    list(modelConstructor, options = {}) {
        this._watcherSource = "list";
        this._eventType = "child";
        this._options = options;
        if (options.offsets) {
            this._offsets = options.offsets;
        }
        const lst = List.create(modelConstructor, options);
        this._modelConstructor = modelConstructor;
        this._classProperties = getAllPropertiesFromClassStructure(new this._modelConstructor());
        this._dynamicProperties = Record.dynamicPathProperties(modelConstructor);
        this.setPathDependantProperties();
        return this;
    }
    /**
     *
     * @param offsetDict
     */
    offsets(offsetDict) {
        this._offsets = offsetDict;
        const lst = List.create(this._modelConstructor, this._options);
        this.setPathDependantProperties();
        return this;
    }
    /**
     * **ids**
     *
     * There are times where you know an array of IDs which you want to watch as a `list`
     * and calling a series of **record** watchers would not work because -- for a given model
     * -- you can only watch one (this is due to the fact that a _record_ watcher does not
     * offset the record by it's ID). This is the intended use-case for this type of _list_
     * watcher.
     *
     * It is worth noting that with this watcher the frontend will indeed get an array of
     * records but from a **Firebase** standpoint this is not a "list watcher" but instead
     * a series of "record watchers".
     *
     * @param ids the list of FK references (simple or composite)
     */
    ids(...ids) {
        if (ids.length === 0) {
            throw new FireModelError(`You attempted to setup a watcher list on a given set of ID's of "${this._modelName}" but the list of ID's was empty!`, "firemodel/not-ready");
        }
        for (const id of ids) {
            this._underlyingRecordWatchers.push(this._options.offsets
                ? Watch.record(this._modelConstructor, {
                    ...(typeof id === "string" ? { id } : id),
                    ...this._options.offsets,
                })
                : Watch.record(this._modelConstructor, id));
        }
        this._watcherSource = "list-of-records";
        this._eventType = "value";
        return this;
    }
    /**
     * **since**
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    since(when, limit) {
        this._query = this._query.orderByChild("lastUpdated").startAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **dormantSince**
     *
     * Watch for all records that have NOT changed since a given date (opposite of "since")
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    dormantSince(when, limit) {
        this._query = this._query.orderByChild("lastUpdated").endAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **after**
     *
     * Watch all records that were created after a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    after(when, limit) {
        this._query = this._query.orderByChild("createdAt").startAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **before**
     *
     * Watch all records that were created before a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    before(when, limit) {
        this._query = this._query.orderByChild("createdAt").endAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **first**
     *
     * Watch for a given number of records; starting with the first/earliest records (createdAt).
     * Optionally you can state an ID from which to start from. This is useful for a pagination
     * strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    first(howMany, startAt) {
        this._query = this._query.orderByChild("createdAt").limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        return this;
    }
    /**
     * **last**
     *
     * Watch for a given number of records; starting with the last/most-recently added records
     * (e.g., createdAt). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    last(howMany, startAt) {
        this._query = this._query.orderByChild("createdAt").limitToLast(howMany);
        if (startAt) {
            this._query = this._query.endAt(startAt);
        }
        return this;
    }
    /**
     * **recent**
     *
     * Watch for a given number of records; starting with the recent/most-recently updated records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the recent record in the list to this value)
     */
    recent(howMany, startAt) {
        this._query = this._query.orderByChild("lastUpdated").limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        return this;
    }
    /**
     * **inactive**
     *
     * Watch for a given number of records; starting with the inactive/most-inactively added records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the inactive record in the list to this value)
     */
    inactive(howMany, startAt) {
        this._query = this._query.orderByChild("lastUpdated").limitToLast(howMany);
        if (startAt) {
            this._query = this._query.endAt(startAt);
        }
        return this;
    }
    /**
     * **fromQuery**
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery(inputQuery) {
        this._query = inputQuery;
        return this;
    }
    /**
     * **all**
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit) {
        if (limit) {
            this._query = this._query.limitToLast(limit);
        }
        return this;
    }
    /**
     * **where**
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where(property, value) {
        let operation = "=";
        let val;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        else {
            val = value;
        }
        this._query = SerializedQuery$1.create(this.db, this._query.path)
            .orderByChild(property)
            // TODO: fix typing issue here.
            // @ts-ignore
            .where(operation, val);
        return this;
    }
    /**
     * Sets properties that could be effected by _dynamic paths_
     */
    setPathDependantProperties() {
        if (this._dynamicProperties.length === 0 ||
            Object.keys(this._offsets).length > 0) {
            const lst = List.create(this._modelConstructor, {
                ...this._options,
                offsets: this._offsets,
            });
            this._query = SerializedQuery$1.create(this.db, lst.dbPath);
            this._modelName = lst.modelName;
            this._pluralName = lst.pluralName;
            this._localPath = lst.localPath;
            this._localPostfix = lst.localPostfix;
        }
    }
}

class WatchRecord extends WatchBase {
    static record(modelConstructor, pk, options = {}) {
        if (!pk) {
            throw new FireModelError(`Attempt made to watch a RECORD but no primary key was provided!`, "firemodel/no-pk");
        }
        const o = new WatchRecord();
        // if options hash has a DB reference; use it
        if (o.db) {
            o._db = options.db;
        }
        o._eventType = "value";
        o._watcherSource = "record";
        const r = Record.createWith(modelConstructor, pk, options.db ? { db: options.db } : {});
        o._query = SerializedQuery$1.create(options.db || FireModel.defaultDb, `${r.dbPath}`);
        o._modelConstructor = modelConstructor;
        o._modelName = r.modelName;
        o._localModelName = r.META.localModelName;
        o._pluralName = r.pluralName;
        o._localPath = r.localPath;
        o._localPostfix = r.META.localPostfix;
        o._dynamicProperties = r.dynamicPathComponents;
        o._compositeKey = r.compositeKey;
        return o;
    }
}

/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path. This must consider a normal **list** or
 * **record** watcher but also a **list-of-records** where instead of a
 * `1:1` relationship between "watcher" and Firebase listener there is instead
 * a `1:M` relationship.
 */
function findWatchers(
/** the database path where change was detected */
dbPath) {
    const inspectListofRecords = (watcher) => {
        const paths = watcher.watcherPaths;
        let found = false;
        paths.forEach((p) => {
            if (dbPath.includes(p)) {
                found = true;
            }
        });
        return found;
    };
    return hashToArray(Watch.inventory).filter((i) => i.watcherSource === "list-of-records"
        ? /** handles the "list-of-records" use case */
            inspectListofRecords(i)
        : /** handles the standard use case */
            dbPath.includes(i.query.path));
}

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized = {};
const hasInitialized = (watcherId, value = true) => {
    if (watcherId) {
        _hasInitialized[watcherId] = value;
    }
    return _hasInitialized;
};
/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
async function waitForInitialization(watcher, timeout = 750) {
    setTimeout(() => {
        if (!ready(watcher)) {
            console.info(`A watcher [ ${watcher.watcherId} ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(", ")} ] which has no data yet.`);
        }
        hasInitialized(watcher.watcherId, "timed-out");
    }, timeout);
    while (!ready(watcher)) {
        await wait(50);
    }
}
function ready(watcher) {
    return hasInitialized()[watcher.watcherId] ? true : false;
}

/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchList() {
    return new WatchList();
}
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchRecord() {
    return new WatchRecord();
}

/** a cache of all the watched  */
let watcherPool = {};
function getWatcherPool() {
    return watcherPool;
}
function getWatcherPoolList() {
    return hashToArray(getWatcherPool());
}
function addToWatcherPool(item) {
    watcherPool[item.watcherId] = item;
}
function getFromWatcherPool(code) {
    return watcherPool[code];
}
function clearWatcherPool() {
    watcherPool = {};
}
/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
function addDispatchForWatcher(code, dispatch) {
    //
}
function removeFromWatcherPool(code) {
    delete watcherPool[code];
    return watcherPool;
}

export { AuditBase, AuditList, AuditLog, AuditRecord, DecoratorProblem, DexieDb, DexieError, DexieList, DexieRecord, DuplicateRelationship, DynamicPropertiesNotReady, FireModel, FireModelError, FireModelProxyError, FiremodelMockApi, FkDoesNotExist, FmEvents, IncorrectReciprocalInverse, List, MissingInverseProperty, MissingReciprocalInverse, Mock, MockError, Model, NamedFakes, NotHasManyRelationship, NotHasOneRelationship, OneWay, PropertyNamePatterns, Record, RecordCrudFailure, RelationshipCardinality, RelationshipPolicy, UnknownRelationshipProblem, UnwatchedLocalEvent, VerboseError, VeuxWrapper, Watch, WatchBase, WatchDispatcher, WatchList, WatchRecord, addDispatchForWatcher, addModelMeta, addPropertyToModelMeta, addRelationshipToModelMeta, addRelationships, addToWatcherPool, belongsTo, buildDeepRelationshipLinks, buildRelationshipPaths, capitalize, clearWatcherPool, compareHashes, constrain, constrainedProperty, createCompositeKey, createCompositeKeyFromFkString, createCompositeKeyRefFromRecord, createCompositeRef, defaultValue, desc, discoverRootPath, dotNotation, encrypt, extractFksFromPaths, fakeIt, findWatchers, firstKey, getAllPropertiesFromClassStructure, getDbIndexes, getFromWatcherPool, getModelMeta, getModelProperty, getModelRelationship, getProperties, getPushKeys, getRelationships, getWatchList, getWatchRecord, getWatcherPool, getWatcherPoolList, hasInitialized, hasMany, hasOne, index, indexesForModel, isConstructable, isHasManyRelationship, isProperty, isRelationship, length, listRegisteredModels, localRelnOp, locallyUpdateFkOnRecord, lowercase, max, min, mock, mockProperties, mockValue, model, modelConstructorLookup, modelNameLookup, modelRegister, modelRegistryLookup, modelsWithMeta, normalized, ownedBy, pathJoin, processHasMany, processHasOne, propertiesByModel, property, propertyDecorator, propertyReflector, pushKey, reduceCompositeNotationToStringRepresentation, relationshipOperation, relationshipsByModel, relnConfirmation, relnRollback, removeFromWatcherPool, slashNotation, stripLeadingSlash, uniqueIndex, updateToAuditChanges, waitForInitialization, withoutMetaOrPrivate, writeAudit };
//# sourceMappingURL=index.js.map
