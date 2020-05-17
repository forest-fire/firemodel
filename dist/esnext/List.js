import { arrayToHash } from "typed-conversions";
import { SerializedQuery } from "@forest-fire/base-serializer";
import { Record } from "./Record";
import { FireModel } from "./FireModel";
import { pathJoin } from "./path";
import { getModelMeta } from "./ModelMeta";
import { FireModelError } from "./errors";
import { capitalize } from "./util";
const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
function addTimestamps(obj) {
    const datetime = new Date().getTime();
    const output = {};
    Object.keys(obj).forEach((i) => {
        output[i] = Object.assign(Object.assign({}, obj[i]), { createdAt: datetime, lastUpdated: datetime });
    });
    return output;
}
export class List extends FireModel {
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
//# sourceMappingURL=List.js.map