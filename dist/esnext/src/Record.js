import { createError } from "common-types";
import { key as fbKey } from "firebase-key";
import { FireModel } from "./FireModel";
import { FMEvents } from "./state-mgmt/index";
// tslint:disable-next-line:no-var-requires
const pathJoin = require("path.join");
export class Record extends FireModel {
    constructor(model, options = {}) {
        super();
        //#endregion
        //#region OBJECT DEFINITION
        this._existsOnDB = false;
        this._writeOperations = [];
        if (!model) {
            const e = new Error(`You can not construct a Record instance without passing in a Model's constructor! `);
            e.name = "FireModel::Forbidden";
            throw e;
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
     * create
     *
     * creates a new -- and empty -- Record object; often used in
     * conjunction with the Record's initialize() method
     */
    static create(model, options = {}) {
        const r = new Record(model, options);
        if (options.silent && !r.db.isMockDb) {
            const e = new Error(`You can only add new records to the DB silently when using a Mock database!`);
            e.name = "FireModel::Forbidden";
            throw e;
        }
        return r;
    }
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param payload the data for the new record
     * @param options
     */
    static async add(model, payload, options = {}) {
        let r;
        try {
            r = Record.create(model, options);
            r._initialize(payload);
            await r._save();
        }
        catch (e) {
            const err = new Error(`Problem adding new Record: ${e.message}`);
            err.name = e.name !== "Error" ? e.name : "FireModel";
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
    static createWith(model, payload, options = {}) {
        const rec = Record.create(model, options);
        rec._initialize(payload);
        return rec;
    }
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
    get data() {
        return this._data;
    }
    get isDirty() {
        return this.META.isDirty ? true : false;
    }
    /**
     * set the dirty flag of the model
     */
    set isDirty(value) {
        this._data.META = { isDirty: value };
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
        const key = fbKey();
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
     * include the "lastUpdated" property. Does NOT allow relationships to be included,
     * this should be done separately.
     *
     * @param props a hash of name value pairs which represent the props being updated and their new values
     */
    async update(props) {
        // can not update relationship properties
        if (Object.keys(props).some((key) => {
            const root = key.split(".")[0];
            return this.META.property(root).isRelationship;
        })) {
            const relProps = Object.keys(props).filter((p) => this.META.property(p).isRelationship);
            const e = new Error(`You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(", ")}.`);
            e.name = "FireModel::NotAllowed";
            throw e;
        }
        const lastUpdated = new Date().getTime();
        const changed = Object.assign({}, props, { lastUpdated });
        await this._updateProps(FMEvents.RECORD_CHANGED_LOCALLY, FMEvents.RECORD_CHANGED, changed);
        if (this.META.audit) {
            // TODO: implement for auditing
        }
        return;
    }
    /**
     * remove
     *
     * Removes the active record from the database and dispatches the change to
     * FE State Mgmt.
     */
    async remove() {
        this.isDirty = true;
        this.dispatch(this._createRecordEvent(this, FMEvents.RECORD_REMOVED_LOCALLY, [
            { path: this.dbPath, value: null }
        ]));
        await this.db.remove(this.dbPath);
        if (this.META.audit) {
            // TODO: implement for auditing
        }
        this.isDirty = false;
        this.dispatch(this._createRecordEvent(this, FMEvents.RECORD_REMOVED, this.data));
    }
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     */
    async set(prop, value) {
        if (this.META.property(prop).isRelationship) {
            const e = new Error(`You can not "set" the property "${prop}" because it is configured as a relationship!`);
            e.name = "FireModel::NotAllowed";
            throw e;
        }
        const lastUpdated = new Date().getTime();
        const changed = {
            [prop]: value,
            lastUpdated
        };
        await this._updateProps(FMEvents.RECORD_CHANGED_LOCALLY, FMEvents.RECORD_CHANGED, changed);
        if (this.META.audit) {
            // TODO: implement for auditing
        }
        return;
    }
    /**
     * Adds another fk (or multiple) to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param refs FK reference (or array of FKs) that should be added to reln
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */
    async addToRelationship(property, refs, optionalValue = true) {
        console.log("property: ", property);
        if (this.META.property(property).relType !== "hasMany") {
            const e = new Error(`FireModel::addToRelationship() - can not use property "${property}" on ${this.modelName} with addToRelationship() because it is not a hasMany relationship`);
            e.name = "FireModel::WrongRelationshipType";
            throw e;
        }
        if (!Array.isArray(refs)) {
            refs = [refs];
        }
        const paths = [];
        const now = new Date().getTime();
        const mps = this.db.multiPathSet("/");
        const inverse = this.META.property(property).inverse;
        const fkRecord = Record.create(this.META.property(property).fkConstructor);
        refs.map(ref => {
            const pathToThisFkReln = pathJoin(this.dbPath, property, ref);
            const fkIsHasMany = inverse
                ? fkRecord.META.property(inverse).relType === "hasMany"
                : false;
            const pathToInverseFkReln = inverse
                ? pathJoin(fkRecord.dbOffset, ref, inverse)
                : null;
            mps.add({ path: pathToThisFkReln, value: optionalValue });
            if (pathToInverseFkReln) {
                mps.add({
                    path: fkIsHasMany
                        ? pathJoin(pathToThisFkReln, this.id)
                        : pathToThisFkReln,
                    value: fkIsHasMany ? true : this.id
                });
            }
            if (typeof this.data[property] === "object" &&
                this.data[property][ref]) {
                console.warn(`The fk of "${ref}" already exists in "${this.modelName}.${property}"!`);
                return;
            }
        });
        mps.add({ path: pathJoin(this.dbPath, "lastUpdated"), value: now });
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED_LOCALLY, mps.payload));
        await mps.execute();
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED, this.data));
    }
    /** indicates whether this record is already being watched locally */
    get isBeingWatched() {
        return FireModel.isBeingWatched(this.dbPath);
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
    async _updateProps(actionTypeStart, actionTypeEnd, changed) {
        this.isDirty = true;
        Object.keys(changed).map((prop) => {
            this._data[prop] = changed[prop];
        });
        const paths = this._getPaths(changed);
        this.dispatch(this._createRecordEvent(this, actionTypeStart, paths));
        const mps = this.db.multiPathSet(this.dbPath);
        paths.map(path => mps.add(path));
        await mps.execute();
        this.isDirty = false;
        this._data.lastUpdated = new Date().getTime();
        // if this path is being watched we should avoid
        // sending a duplicative event
        if (!this.isBeingWatched) {
            this.dispatch(this._createRecordEvent(this, actionTypeEnd, this.data));
        }
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
        if (!this.id) {
            this.id = fbKey();
        }
        const now = new Date().getTime();
        if (!this.get("createdAt")) {
            this._data.createdAt = now;
        }
        this._data.lastUpdated = now;
        if (!this.db) {
            const e = new Error(`Attempt to save Record failed as the Database has not been connected yet. Try settingFireModel first.`);
            e.name = "FiremodelError";
            throw e;
        }
        const paths = [{ path: "/", value: this._data }];
        this.isDirty = true;
        this.dispatch(this._createRecordEvent(this, FMEvents.RECORD_ADDED_LOCALLY, paths));
        const mps = this.db.multiPathSet(this.dbPath);
        paths.map(path => mps.add(path));
        await mps.execute();
        this.isDirty = false;
        if (!FireModel.isBeingWatched(this.dbPath)) {
            // TODO: is there any reason we'd need to load from server like with update?
            this.dispatch(this._createRecordEvent(this, FMEvents.RECORD_ADDED, this.data));
        }
        return this;
    }
}
//# sourceMappingURL=Record.js.map