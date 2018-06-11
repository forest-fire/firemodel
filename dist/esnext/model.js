import { createError } from "common-types";
import { VerboseError } from "./VerboseError";
import { Record, List } from "./index";
import * as pluralize from "pluralize";
import { camelCase } from "lodash";
import { SerializedQuery } from "serialized-query";
import { slashNotation } from "./util";
import { key as fbk } from "firebase-key";
export const baseLogger = {
    log: (message) => console.log(`${this.modelName}/${this._key}: ${message}`),
    warn: (message) => console.warn(`${this.modelName}/${this._key}: ${message}`),
    debug: (message) => {
        const stage = process.env.STAGE || process.env.AWS_STAGE || process.env.ENV;
        if (stage !== "prod") {
            console.log(`${this.modelName}/${this._key}: ${message}`);
        }
    },
    error: (message) => console.error(`${this.modelName}/${this._key}: ${message}`)
};
export class Model {
    //#endregion
    constructor(_schemaClass, db, logger) {
        this._schemaClass = _schemaClass;
        // tslint:disable-next-line:member-ordering
        this._mockGenerator = h => () => {
            return this._bespokeMockGenerator
                ? Object.assign({}, this._defaultGenerator(h)(), this._bespokeMockGenerator(h)()) : this._defaultGenerator(h)();
        };
        this._defaultGenerator = h => () => ({
            createdAt: new Date(h.faker.date.past()).toISOString(),
            lastUpdated: new Date().toISOString()
        });
        this._db = db;
        if (!Model.defaultDb) {
            Model.defaultDb = db;
        }
        this.logger = logger ? logger : baseLogger;
        this._schema = new this.schemaClass();
    }
    static create(schema, options = {}) {
        const db = options.db || Model.defaultDb;
        const logger = options.logger || baseLogger;
        const model = new Model(schema, db, logger);
        return model;
    }
    /** the singular name of the model */
    get modelName() {
        return camelCase(this._schema.constructor.name);
    }
    get pluralName() {
        return this._pluralName ? this._pluralName : pluralize.plural(this.modelName);
    }
    set pluralName(name) {
        this._pluralName = name;
    }
    set mockGenerator(cb) {
        this._bespokeMockGenerator = cb;
    }
    //#region PUBLIC API
    get schemaClass() {
        return this._schemaClass;
    }
    /** Database access */
    get db() {
        return this._db;
    }
    get schema() {
        return this._schema;
    }
    get dbPath() {
        return [this._schema.META.dbOffset, this.pluralName].join(".");
    }
    get localPath() {
        return [this._schema.META.localOffset, this.pluralName].join(".");
    }
    get relationships() {
        return this._schema.META.relationships;
    }
    get properties() {
        return this._schema.META.properties;
    }
    get pushKeys() {
        return this._schema.META ? this._schema.META.pushKeys : [];
    }
    // /**
    //  * Add a new record of type T, optionally including the payload
    //  *
    //  * @param hash the values that you want this new object to be initialized as; note that if you include an "id" property it will assume this is from the DB, if you don't then it will immediately add it and create an id.
    //  */
    // public async newRecord(hash?: Partial<T>) {
    //   console.log(this.schemaClass);
    //   return hash
    //     ? Record.add(this.schemaClass, hash as T, { db: this.db })
    //     : Record.create(this.schemaClass, { db: this.db });
    // }
    /**
     * Get an existing record from the  DB and return as a Record
     *
     * @param id the primary key for the record
     */
    async getRecord(id) {
        const record = await Record.get(this._schemaClass, id);
        return record;
    }
    /**
     * Returns a list of ALL objects of the given schema type
     */
    async getAll(query) {
        const list = new List(this);
        return query ? list.load(query) : list.load(this.dbPath);
    }
    /**
     * Finds a single records within a list
     *
     * @param prop the property on the Schema which you are looking for a value in
     * @param value the value you are looking for the property to equal; alternatively you can pass a tuple with a comparison operation and a value
     */
    async findRecord(prop, value) {
        const query = this._findBuilder(prop, value, true);
        const results = await this.db.getList(query);
        if (results.length > 0) {
            const first = results.pop();
            const record = Record.get(this._schemaClass, first.id);
            return record;
        }
        else {
            throw createError("not-found", `Not Found: didn't find any "${this.pluralName}" which had "${prop}" set to "${value}"; note the path in the database which was searched was "${this.dbPath}".`);
        }
    }
    async findAll(prop, value) {
        const query = this._findBuilder(prop, value);
        let results;
        try {
            results = await this.db.getList(query);
        }
        catch (e) {
            console.log("Error attempting to findAll() in Model.", e);
            throw createError("model/findAll", `\nFailed getting via getList() with query` + JSON.stringify(query, null, 2), e);
        }
        return new List(this, results);
    }
    /** sets a record to the database */
    async set(record, auditInfo = {}) {
        if (!record.id) {
            throw createError("set/no-id", `Attempt to set "${this.dbPath}" in database but record had no "id" property.`);
        }
        const now = this.now();
        record = Object.assign({}, record, { lastUpdated: now });
        auditInfo = Object.assign({}, auditInfo, { properties: Object.keys(record) });
        const ref = await this.crud("set", now, slashNotation(this.dbPath, record.id), record, auditInfo);
        return ref;
    }
    /** Push a new record onto a model's list using Firebase a push-ID */
    async push(newRecord, auditInfo = {}) {
        const now = this.now();
        const id = fbk();
        newRecord = Object.assign({}, newRecord, { lastUpdated: now, createdAt: now });
        auditInfo = Object.assign({}, auditInfo, { properties: Object.keys(newRecord) });
        return Record.get(this._schemaClass, id);
    }
    async update(key, updates, auditInfo = {}) {
        const now = this.now();
        auditInfo = Object.assign({ auditInfo }, { updatedProperties: Object.keys(updates) });
        updates = Object.assign({}, updates, { lastUpdated: now });
        await this.crud("update", now, slashNotation(this.dbPath, key), updates, auditInfo);
    }
    /**
     * Remove
     *
     * Remove a record from the database
     *
     * @param key         the specific record id (but can alternatively be the full path if it matches dbPath)
     * @param returnValue optionally pass back the deleted record along removing from server
     * @param auditInfo   any additional information to be passed to the audit record (if Model has turned on)
     */
    async remove(key, returnValue = false, auditInfo = {}) {
        if (!key) {
            const e = new Error(`Trying to call remove(id) on a ${this.modelName} Model class can not be done when ID is undefined!`);
            e.name = "NotAllowed";
            throw e;
        }
        const now = this.now();
        let value;
        if (returnValue) {
            value = await this._db.getValue(slashNotation(this.dbPath, key));
        }
        await this.crud("remove", now, key.match(this.dbPath) ? key : slashNotation(this.dbPath, key), null, auditInfo);
        return returnValue ? value : undefined;
    }
    async getAuditTrail(filter = {}) {
        const { since, last } = filter;
        const path = `${Model.auditBase}/${this.pluralName}`;
        let query = SerializedQuery.path(path);
        if (since) {
            const startAt = new Date(since).toISOString();
            query = query.orderByChild("when").startAt(startAt);
        }
        if (last) {
            query = query.limitToLast(last);
        }
        return this.db.getList(query);
    }
    //#endregion
    //#region PRIVATE API
    async audit(crud, when, key, info) {
        const path = slashNotation(Model.auditBase, this.pluralName);
        return this.db.push(path, {
            crud,
            when,
            key,
            info
        });
    }
    /**
     * crud
     *
     * Standardized processing of all CRUD operations
     *
     * @param op The CRUD operation being performed
     * @param key The record id which is being performed on
     * @param value The new-value parameter (meaning varies on context)
     * @param auditInfo the meta-fields for the audit trail
     */
    async crud(op, when, key, value, auditInfo) {
        const isAuditable = this._schema.META.audit;
        if (isAuditable) {
            console.log("auditing: ", op);
            await this.audit(op, when, key, auditInfo);
        }
        switch (op) {
            case "set":
                return this.db.set(key, value);
            case "update":
                return this.db.update(key, value);
            case "push":
                // PUSH unlike SET returns a reference to the newly created record
                return this.db.set(key, value).then(() => this.db.ref(key));
            case "remove":
                return this.db.remove(key);
            default:
                throw new VerboseError({
                    code: "unknown-operation",
                    message: `The operation "${op}" is not known!`,
                    module: "crud"
                });
        }
    }
    _findBuilder(child, value, singular = false) {
        let operation = "=";
        if (value instanceof Array) {
            operation = value[0];
            value = value[1];
        }
        let query = SerializedQuery.path(this.dbPath).orderByChild(child);
        if (singular) {
            query = query.limitToFirst(1);
        }
        switch (operation) {
            case "=":
                return query.equalTo(value);
            case ">":
                return query.startAt(value);
            case "<":
                return query.endAt(value);
            default:
                throw new VerboseError({
                    code: "invalid-operation",
                    message: `Invalid comparison operater "${operation}" used in find query`,
                    module: "findXXX"
                });
        }
    }
    //#region mocking
    // tslint:disable-next-line:member-ordering
    generate(quantity, override = {}) {
        this.db.mock.queueSchema(this.modelName, quantity, override);
        this.db.mock.generate();
    }
    //#endregion
    now() {
        return Date.now();
    }
}
//#region PROPERTIES
Model.defaultDb = null;
/** The base path in the database to store audit logs */
Model.auditBase = "logging/audit_logs";
//# sourceMappingURL=model.js.map