import { createError } from "common-types";
import { Model } from "./model";
import { key as fbk } from "firebase-key";
export class Record {
    constructor(_model, options = {}) {
        this._model = _model;
        this._existsOnDB = false;
        this._writeOperations = [];
        this._data = new _model.schemaClass();
    }
    /**
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create(schema, options = {}) {
        const model = Model.create(schema, options);
        const record = new Record(model, options);
        return record;
    }
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param newRecord the data for the new record
     * @param options
     */
    static async add(schema, newRecord, options = {}) {
        let r;
        try {
            r = Record.create(schema, options);
            r._initialize(newRecord);
            await r._save();
        }
        catch (e) {
            const err = new Error(`Problem adding new Record: ${e.message}`);
            err.name = e.name !== "Error" ? e.name : "FiremodelError";
            throw e;
        }
        return r;
    }
    /**
     * load
     *
     * static method to create a Record when you want to load the
     * state of the record with something you already have.
     *
     * Intent should be that this record already exists in the
     * database. If you want to add to the database then use add()
     */
    static load(schema, record, options = {}) {
        const r = Record.create(schema, options);
        r._initialize(record);
        return r;
    }
    static async get(schema, id, options = {}) {
        const record = Record.create(schema, options);
        await record._getFromDB(id);
        return record;
    }
    get data() {
        return this._data;
    }
    get isDirty() {
        return this._writeOperations.length > 0 ? true : false;
    }
    get META() {
        return this._model.schema.META;
    }
    get db() {
        return this._model.db;
    }
    get pluralName() {
        return this._model.pluralName;
    }
    get pushKeys() {
        return this._model.schema.META.pushKeys;
    }
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */
    get dbPath() {
        if (!this.data.id) {
            throw createError("record/invalid-path", `Invalid Record Path: you can not ask for the dbPath before setting an "id" property.`);
        }
        return [this.data.META.dbOffset, this.pluralName, this.data.id].join("/");
    }
    get modelName() {
        return this.data.constructor.name.toLowerCase();
    }
    /** The Record's primary key */
    get id() {
        return this.data.id;
    }
    set id(val) {
        if (this.data.id) {
            const e = new Error(`You may not re-set the ID of a record [ ${this.data.id} → ${val} ].`);
            e.name = "NotAllowed";
            throw e;
        }
        this._data.id = val;
    }
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */
    get dbOffset() {
        return this.data.META.dbOffset;
    }
    /**
     * returns the record's location in the frontend state management framework;
     * depends on appropriate configuration of model to be accurate.
     */
    get localPath() {
        if (!this.data.id) {
            throw new Error('Invalid Path: you can not ask for the dbPath before setting an "id" property.');
        }
        return [this.data.META.localOffset, this.pluralName, this.data.id].join("/");
    }
    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    _initialize(data) {
        Object.keys(data).map(key => {
            this._data[key] = data[key];
        });
        const relationships = this.META.relationships;
        const ownedByRels = (relationships || [])
            .filter(r => r.relType === "ownedBy")
            .map(r => r.property);
        const hasManyRels = (relationships || [])
            .filter(r => r.relType === "hasMany")
            .map(r => r.property);
        // default hasMany to empty hash
        hasManyRels.map((p) => {
            if (!this._data[p]) {
                this._data[p] = {};
            }
        });
        const now = new Date().getTime();
        if (!this._data.lastUpdated) {
            this._data.lastUpdated = now;
        }
        if (!this._data.createdAt) {
            this._data.createdAt = now;
        }
    }
    get existsOnDB() {
        return this.data && this.data.id ? true : false;
    }
    async update(hash) {
        if (!this.data.id || !this._existsOnDB) {
            throw new Error(`Invalid Operation: you can not update a record which doesn't have an "id" or which has never been saved to the database`);
        }
        return this.db.update(this.dbPath, hash);
    }
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    async pushKey(property, value) {
        if (this.META.pushKeys.indexOf(property) === -1) {
            throw createError("invalid-operation/not-pushkey", `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`);
        }
        if (!this.existsOnDB) {
            throw createError("invalid-operation/not-on-db", `Invalid Operation: you can not push to property "${property}" before saving the record to the database`);
        }
        const key = fbk();
        const currentState = this.get(property) || {};
        const newState = Object.assign({}, currentState, { [key]: value });
        // set state locally
        this.set(property, newState);
        // push updates to db
        const write = this.db.multiPathSet(`${this.dbPath}/`);
        write.add({ path: `lastUpdated`, value: new Date().getTime() });
        write.add({ path: `${property}/${key}`, value });
        try {
            await write.execute();
        }
        catch (e) {
            throw createError("multi-path/write-error", "", e);
        }
        return key;
    }
    /**
     * Updates a set of properties on a given model atomically (aka, all at once); will automatically
     * include the "lastUpdated" property.
     *
     * @param props a hash of name value pairs which represent the props being updated and their new values
     */
    async updateProps(props) {
        const updater = this.db.multiPathSet(this.dbPath);
        Object.keys(props).map((key) => {
            if (typeof props[key] === "object") {
                const existingState = this.get(key);
                props[key] = Object.assign({}, existingState, props[key]);
            }
            else {
                if (key !== "lastUpdated") {
                    updater.add({ path: key, value: props[key] });
                }
            }
            this.set(key, props[key]);
        });
        const now = new Date().getTime();
        updater.add({ path: "lastUpdated", value: now });
        this._data.lastUpdated = now;
        try {
            await updater.execute();
        }
        catch (e) {
            throw createError("UpdateProps", `An error occurred trying to update ${this._model.modelName}:${this.id}`, e);
        }
    }
    /**
     * Adds another fk to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param ref reference to ID of related entity
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */
    async addHasMany(property, ref, optionalValue = true) {
        if (this.META.property(property).relType !== "hasMany") {
            const e = new Error(`The property "${property}" does NOT have a "hasMany" relationship on ${this.modelName}`);
            e.name = "InvalidRelationship";
            throw e;
        }
        if (typeof this.data[property] === "object" && this.data[property][ref]) {
            console.warn(`The fk of "${ref}" already exists in "${this.modelName}.${property}"!`);
            return;
        }
        await this.db
            .multiPathSet(this.dbPath)
            .add({ path: `${property}/${ref}/`, value: optionalValue })
            .add({ path: "lastUpdated", value: new Date().getTime() })
            .execute();
    }
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     */
    async set(prop, value) {
        // TODO: add interaction points for client-side state management; goal
        // is to have local state changed immediately but with meta data to indicate
        // that we're waiting for backend confirmation.
        this._data[prop] = value;
        await this.db
            .multiPathSet(this.dbPath)
            .add({ path: `${prop}/`, value })
            .add({ path: "lastUpdated/", value: new Date().getTime() })
            .execute();
        return;
    }
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
            localPath: this.localPath,
            data: this.data.toString()
        };
    }
    /**
     * Load data from a record in database
     */
    async _getFromDB(id) {
        if (!this.db) {
            const e = new Error(`The attempt to load data into a Record requires that the DB property be initialized first!`);
            e.name = "NoDatabase";
            throw e;
        }
        this._data.id = id;
        const data = await this.db.getRecord(this.dbPath);
        if (data && data.id) {
            this._initialize(data);
        }
        else {
            throw new Error(`Unknown Key: the key "${id}" was not found in Firebase at "${this.dbPath}".`);
        }
        return this;
    }
    async _save() {
        if (this.id) {
            const e = new Error(`Saving after ID is set is not allowed [ ${this.id} ]`);
            e.name = "InvalidSave";
            throw e;
        }
        this.id = fbk();
        if (!this.db) {
            const e = new Error(`Attempt to save Record failed as the Database has not been connected yet. Try setting Model.defaultDb first.`);
            e.name = "FiremodelError";
            throw e;
        }
        await this.db.set(this.dbPath, this.data);
        return this;
    }
}
//# sourceMappingURL=record.js.map