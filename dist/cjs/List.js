"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("./Record");
const serialized_query_1 = require("serialized-query");
const FireModel_1 = require("./FireModel");
const path_1 = require("./path");
const ModelMeta_1 = require("./ModelMeta");
const state_mgmt_1 = require("./state-mgmt");
const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
function addTimestamps(obj) {
    const datetime = new Date().getTime();
    const output = {};
    Object.keys(obj).forEach(i => {
        output[i] = Object.assign({}, obj[i], { createdAt: datetime, lastUpdated: datetime });
    });
    return output;
}
class List extends FireModel_1.FireModel {
    constructor(model, options = {}) {
        super();
        //#endregion
        this._data = [];
        this._modelConstructor = model;
        this._model = new model();
        if (options.db) {
            this._db = options.db;
            if (!FireModel_1.FireModel.defaultDb) {
                FireModel_1.FireModel.defaultDb = options.db;
            }
        }
    }
    //#region STATIC Interfaces
    /**
     * Sets the default database to be used by all FireModel classes
     * unless explicitly told otherwise
     */
    static set defaultDb(db) {
        FireModel_1.FireModel.defaultDb = db;
    }
    static get defaultDb() {
        return FireModel_1.FireModel.defaultDb;
    }
    /**
     * Set
     *
     * Sets a given model to the payload passed in. This is
     * a destructive operation ... any other records of the
     * same type that existed beforehand are removed.
     */
    static async set(model, payload) {
        try {
            const m = Record_1.Record.create(model);
            // If Auditing is one we must be more careful
            if (m.META.audit) {
                const existing = await List.all(model);
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
                await FireModel_1.FireModel.defaultDb.set(`${m.META.dbOffset}/${m.pluralName}`, addTimestamps(payload));
            }
            const current = await List.all(model);
            return current;
        }
        catch (e) {
            const err = new Error(`Problem adding new Record: ${e.message}`);
            err.name = e.name !== "Error" ? e.name : "FireModel";
            throw e;
        }
    }
    static set dispatch(fn) {
        FireModel_1.FireModel.dispatch = fn;
    }
    static create(model, options = {}) {
        return new List(model);
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
        query.setPath(list.dbPath);
        await list.load(query);
        list.dispatch({
            type: state_mgmt_1.FMEvents.RECORD_LIST,
            modelName: list.modelName,
            pluralName: list.pluralName,
            dbPath: list.dbPath,
            localPath: list.localPath,
            modelConstructor: list._modelConstructor,
            query,
            hashCode: query.hashCode(),
            records: list.data
        });
        return list;
    }
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */
    static async all(model, options = {}) {
        const query = new serialized_query_1.SerializedQuery().orderByChild("lastUpdated");
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
        const query = new serialized_query_1.SerializedQuery()
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
        const query = new serialized_query_1.SerializedQuery()
            .orderByChild("lastUpdated")
            .limitToFirst(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    /**
     * since
     *
     * Bring back all records that have changed since a given date
     *
     * @param schema the TYPE you are interested
     * @param since  the datetime in miliseconds
     * @param options
     */
    static async since(model, since, options = {}) {
        if (typeof since !== "number") {
            const e = new Error(`Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`);
            e.name = "NotAllowed";
            throw e;
        }
        const query = new serialized_query_1.SerializedQuery()
            .orderByChild("lastUpdated")
            .startAt(since);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    static async inactive(model, howMany, options = {}) {
        const query = new serialized_query_1.SerializedQuery()
            .orderByChild("lastUpdated")
            .limitToLast(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    static async last(model, howMany, options = {}) {
        const query = new serialized_query_1.SerializedQuery()
            .orderByChild("createdAt")
            .limitToFirst(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    static async where(model, property, value, options = {}) {
        let operation = "=";
        let val = value;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        const query = new serialized_query_1.SerializedQuery()
            .orderByChild(property)
            .where(operation, val);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    get length() {
        return this._data.length;
    }
    get dbPath() {
        return [this.META.dbOffset, this.pluralName].join("/");
    }
    get localPath() {
        const meta = ModelMeta_1.getModelMeta(this._model);
        return path_1.pathJoin(meta.localOffset, this.pluralName, meta.localPostfix).replace(/\//g, ".");
    }
    get localPathToSince() {
        const lp = this.META.localPostfix
            ? this.localPath.replace(`/${this.META.localPostfix}`, "")
            : this.localPath;
        return path_1.pathJoin(lp, "since");
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
        const r = Record_1.Record.create(this._modelConstructor);
        if (filtered.length > 0) {
            r._initialize(filtered[0]);
            return r;
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
                this.META.relationship(prop).relType === "ownedBy")
            ? this.filterWhere(prop, value)
            : this.filterContains(prop, value);
        if (list.length > 0) {
            return Record_1.Record.createWith(this._modelConstructor, list._data[0]);
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const valid = this.META.isProperty(prop) ||
                    (this.META.isRelationship(prop) &&
                        this.META.relationship(prop).relType === "ownedBy")
                    ? this.map(i => i[prop])
                    : this.map(i => Object.keys(i[prop]));
                const e = new Error(`List<${this.modelName}>.findWhere(${prop}, ${value}) was not found in the List [ length: ${this.data.length} ]. \n\nValid values include: \n\n${valid.join("\t")}`);
                e.name = "NotFound";
                throw e;
            }
        }
    }
    /**
     * provides a map over the data structured managed by the List; there will be no mutations to the
     * data managed by the list
     */
    map(f) {
        return this.data.map(f);
    }
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
        const find = this.filter(f => f.id === id);
        if (find.length === 0) {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            const e = new Error(`Could not find "${id}" in list of ${this.pluralName}`);
            e.name = "NotFound";
            throw e;
        }
        const r = Record_1.Record.create(this._modelConstructor);
        r._initialize(find.data[0]);
        return r;
    }
    async removeById(id, ignoreOnNotFound = false) {
        const rec = this.findById(id, null);
        if (!rec) {
            if (!ignoreOnNotFound) {
                const e = new Error(`Could not remove "${id}" in list of ${this.pluralName} as the ID was not found!`);
                e.name = "NotFound";
                throw e;
            }
            else {
                return;
            }
        }
        const removed = await Record_1.Record.remove(this._modelConstructor, id, rec);
        this._data = this.filter(f => f.id !== id).data;
    }
    async add(payload) {
        const newRecord = await Record_1.Record.add(this._modelConstructor, payload);
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
    async load(pathOrQuery) {
        if (!this.db) {
            const e = new Error(`The attempt to load data into a List requires that the DB property be initialized first!`);
            e.name = "NoDatabase";
            throw e;
        }
        this._data = await this.db.getList(pathOrQuery);
        return this;
    }
}
exports.List = List;
//# sourceMappingURL=List.js.map