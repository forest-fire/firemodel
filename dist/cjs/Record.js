"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const firebase_key_1 = require("firebase-key");
const FireModel_1 = require("./FireModel");
const buildDeepRelationshipLinks_1 = require("./record/buildDeepRelationshipLinks");
const index_1 = require("./state-mgmt/index");
const path_1 = require("./path");
const ModelMeta_1 = require("./ModelMeta");
const Audit_1 = require("./Audit");
const util_1 = require("./util");
const _1 = require(".");
const findWatchers_1 = require("./watchers/findWatchers");
const isHasManyRelationship_1 = require("./verifications/isHasManyRelationship");
const errors_1 = require("./errors");
const buildRelationshipPaths_1 = require("./record/relationships/buildRelationshipPaths");
const relationshipOperation_1 = require("./record/relationshipOperation");
const createCompositeKeyString_1 = require("./record/createCompositeKeyString");
const createCompositeKeyFromFkString_1 = require("./record/createCompositeKeyFromFkString");
const DatabaseCrudFailure_1 = require("./errors/record/DatabaseCrudFailure");
const fast_copy_1 = __importDefault(require("fast-copy"));
const WatchDispatcher_1 = require("./watchers/WatchDispatcher");
const UnwatchedLocalEvent_1 = require("./state-mgmt/UnwatchedLocalEvent");
class Record extends FireModel_1.FireModel {
    constructor(model, options = {}) {
        super();
        this.options = options;
        //#endregion
        //#region INSTANCE DEFINITION
        this._existsOnDB = false;
        this._writeOperations = [];
        this._data = {};
        this._modelConstructor = model;
        this._model = new model();
        this._data = new model();
    }
    //#region STATIC INTERFACE
    static set defaultDb(db) {
        FireModel_1.FireModel.defaultDb = db;
    }
    static get defaultDb() {
        return FireModel_1.FireModel.defaultDb;
    }
    static set dispatch(fn) {
        FireModel_1.FireModel.dispatch = fn;
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
            throw common_types_1.createError("record/not-ready", `you can not ask for the dbPath before setting an "id" property [ ${this.modelName} ]`);
        }
        return [
            this._injectDynamicPathProperties(this.dbOffset),
            this.pluralName,
            this.data.id
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
        return _1.createCompositeKey(this);
    }
    /**
     * a string value which is used in relationships to fully qualify
     * a composite string (aka, a model which has a dynamic dbOffset)
     */
    get compositeKeyRef() {
        return createCompositeKeyString_1.createCompositeKeyRefFromRecord(this);
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
            throw new errors_1.FireModelError(`You may not re-set the ID of a record [ ${this.modelName}.id ${this.data.id} => ${val} ].`, "firemodel/not-allowed");
        }
        this._data.id = val;
    }
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */
    get dbOffset() {
        return ModelMeta_1.getModelMeta(this).dbOffset;
    }
    /**
     * returns the record's location in the frontend state management framework;
     * this can include dynamic properties characterized in the path string by
     * leading ":" character.
     */
    get localPath() {
        let prefix = this.localPrefix;
        this.localDynamicComponents.forEach(prop => {
            prefix = prefix.replace(`:${prop}`, this.get(prop));
        });
        return path_1.pathJoin(prefix, this.META.localModelName !== this.modelName
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
        return ModelMeta_1.getModelMeta(this).localPrefix;
    }
    get existsOnDB() {
        return this.data && this.data.id ? true : false;
    }
    /** indicates whether this record is already being watched locally */
    get isBeingWatched() {
        return FireModel_1.FireModel.isBeingWatched(this.dbPath);
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
            throw new errors_1.FireModelError(`You can only add new records to the DB silently when using a Mock database!`, "forbidden");
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
            throw common_types_1.createError(`firemodel/record::local`, "You used the static Record.local() method but passed nothing into the 'values' property! If you just want to skip this error then you can set the options to { ignoreEmptyValues: true } or just use the Record.create() method.");
        }
        if (values) {
            const defaultValues = rec.META.properties.filter(i => i.defaultValue !== undefined);
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
        try {
            r = Record.createWith(model, payload, options);
            if (!payload.id) {
                payload.id = r.db.isMockDb
                    ? firebase_key_1.key()
                    : await r.db.getPushKey(r.dbOffset);
            }
            await r._initialize(payload, options);
            const defaultValues = r.META.properties.filter(i => i.defaultValue !== undefined);
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
                throw new errors_1.FireModelError(`Permission error while trying to add the ${util_1.capitalize(rec.modelName)} to the database path ${rec.dbPath}`, "firemodel/permission-denied");
            }
            if (e.name.includes("firemodel")) {
                throw e;
            }
            throw new errors_1.FireModelProxyError(e, "Failed to add new record");
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
            throw new errors_1.FireModelError(`Trying to create a ${util_1.capitalize(rec.modelName)} with the "setDeepRelationships" property set. This is NOT allowed; consider the 'Record.add()' method instead.`, "not-allowed");
        }
        const properties = typeof payload === "string"
            ? createCompositeKeyFromFkString_1.createCompositeKeyFromFkString(payload, rec.modelConstructor)
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
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    async _initialize(data, options = {}) {
        var e_1, _a;
        if (data) {
            Object.keys(data).map(key => {
                this._data[key] = data[key];
            });
        }
        const relationships = ModelMeta_1.getModelMeta(this).relationships;
        const hasOneRels = (relationships || [])
            .filter(r => r.relType === "hasOne")
            .map(r => r.property);
        const hasManyRels = (relationships || [])
            .filter(r => r.relType === "hasMany")
            .map(r => r.property);
        try {
            /**
             * Sets hasMany to default `{}` if nothing was set.
             * Also, if the option `deepRelationships` is set to `true`,
             * it will look for relationships hashes instead of the typical
             * `fk: true` pairing.
             */
            for (var hasManyRels_1 = __asyncValues(hasManyRels), hasManyRels_1_1; hasManyRels_1_1 = await hasManyRels_1.next(), !hasManyRels_1_1.done;) {
                const oneToManyProp = hasManyRels_1_1.value;
                if (!this._data[oneToManyProp]) {
                    this._data[oneToManyProp] = {};
                }
                if (options.setDeepRelationships) {
                    if (this._data[oneToManyProp]) {
                        await buildDeepRelationshipLinks_1.buildDeepRelationshipLinks(this, oneToManyProp);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (hasManyRels_1_1 && !hasManyRels_1_1.done && (_a = hasManyRels_1.return)) await _a.call(hasManyRels_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const now = new Date().getTime();
        if (!this._data.lastUpdated) {
            this._data.lastUpdated = now;
        }
        if (!this._data.createdAt) {
            this._data.createdAt = now;
        }
    }
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */
    async pushKey(property, value) {
        if (this.META.pushKeys.indexOf(property) === -1) {
            throw common_types_1.createError("invalid-operation/not-pushkey", `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`);
        }
        if (!this.existsOnDB) {
            throw common_types_1.createError("invalid-operation/not-on-db", `Invalid Operation: you can not push to property "${property}" before saving the record to the database`);
        }
        const key = this.db.isMockDb
            ? firebase_key_1.key()
            : await this.db.getPushKey(path_1.pathJoin(this.dbPath, property));
        await this.db.set(path_1.pathJoin(this.dbPath, property), value);
        await this.db.set(path_1.pathJoin(this.dbPath, "lastUpdated"), new Date().getTime());
        // set firemodel state locally
        const currentState = this.get(property) || {};
        const newState = Object.assign({}, currentState, { [key]: value });
        this.set(property, newState);
        return key;
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
        // can not update relationship properties
        if (Object.keys(props).some((key) => {
            const root = key.split(".")[0];
            return this.META.property(root).isRelationship;
        })) {
            const relProps = Object.keys(props).filter((p) => this.META.property(p).isRelationship);
            throw new errors_1.FireModelError(`You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(", ")}.`, `firemodel/not-allowed`);
        }
        const lastUpdated = new Date().getTime();
        const changed = Object.assign({}, props, { lastUpdated });
        const rollback = fast_copy_1.default(this.data);
        // changes local Record to include updates immediately
        this._data = Object.assign({}, this.data, changed);
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
        await this._localCrudOperation("remove" /* remove */, fast_copy_1.default(this.data));
        this.isDirty = false;
    }
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     * @param silent a flag to indicate whether the change to the prop should be updated to the database or not
     */
    async set(prop, value, silent = false) {
        const rollback = fast_copy_1.default(this.data);
        const meta = this.META.property(prop);
        if (!meta) {
            throw new errors_1.FireModelError(`There was a problem getting the meta data for the model ${util_1.capitalize(this.modelName)} while attempting to set the "${prop}" property to: ${value}`);
        }
        if (meta.isRelationship) {
            throw new errors_1.FireModelError(`You can not "set" the property "${prop}" because it is configured as a relationship!`, "firemodel/not-allowed");
        }
        const lastUpdated = new Date().getTime();
        const changed = {
            [prop]: value,
            lastUpdated
        };
        // locally change Record values
        this.META.isDirty = true;
        this._data = Object.assign({}, this._data, changed);
        // dispatch
        if (!silent) {
            await this._localCrudOperation("update" /* update */, rollback, {
                silent
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
    async associate(property, refs, options = {}) {
        const meta = ModelMeta_1.getModelMeta(this);
        if (!meta.relationship(property)) {
            throw new errors_1.FireModelError(`Attempt to associate the property "${property}" can not be done on model ${util_1.capitalize(this.modelName)} because the property is not defined!`, `firemodel/not-allowed`);
        }
        if (!meta.relationship(property).relType) {
            throw new errors_1.FireModelError(`For some reason the property "${property}" on the model ${util_1.capitalize(this.modelName)} doesn't have cardinality assigned to the "relType" (aka, hasMany, hasOne).\n\nThe META for relationships on the model are: ${JSON.stringify(meta.relationships, null, 2)}`, `firemodel/unknown`);
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
                    throw new errors_1.FireModelError(`Attempt to use "associate()" with a "hasOne" relationship [ ${property}] on the model ${util_1.capitalize(this.modelName)}.`, "firemodel/invalid-cardinality");
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
    async disassociate(property, refs, options = {}) {
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
        if (!isHasManyRelationship_1.isHasManyRelationship(this, property)) {
            throw new errors_1.NotHasManyRelationship(this, property, "addToRelationship");
        }
        fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
        let paths = [];
        const now = new Date().getTime();
        fkRefs.map(ref => {
            paths = [
                ...buildRelationshipPaths_1.buildRelationshipPaths(this, property, ref, {
                    now,
                    altHasManyValue
                }),
                ...paths
            ];
        });
        await relationshipOperation_1.relationshipOperation(this, "add", property, fkRefs, paths, options);
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
        if (!isHasManyRelationship_1.isHasManyRelationship(this, property)) {
            throw new errors_1.NotHasManyRelationship(this, property, "removeFromRelationship");
        }
        fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
        let paths = [];
        const now = new Date().getTime();
        fkRefs.map(ref => {
            paths = [
                ...buildRelationshipPaths_1.buildRelationshipPaths(this, property, ref, {
                    now,
                    operation: "remove"
                }),
                ...paths
            ];
        });
        await relationshipOperation_1.relationshipOperation(this, "remove", property, fkRefs, paths, options);
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
        fkRefs.map(ref => {
            paths = [
                ...buildRelationshipPaths_1.buildRelationshipPaths(this, property, ref, {
                    now,
                    operation: "remove"
                }),
                ...paths
            ];
        });
        await relationshipOperation_1.relationshipOperation(this, "clear", property, fkRefs, paths, options);
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
            throw new errors_1.FireModelError(`Failed to set the relationship ${this.modelName}.${property} because no FK was passed in!`, "firemodel/not-allowed");
        }
        if (isHasManyRelationship_1.isHasManyRelationship(this, property)) {
            throw new errors_1.NotHasOneRelationship(this, property, "setRelationship");
        }
        const paths = buildRelationshipPaths_1.buildRelationshipPaths(this, property, fkId);
        await relationshipOperation_1.relationshipOperation(this, "set", property, [fkId], paths, options);
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
            compositeKey: this.compositeKey,
            localPath: this.localPath,
            data: this.data.toString()
        };
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
                const deltas = util_1.compareHashes(currentValue, priorValue);
                const auditLogEntries = [];
                const added = deltas.added.forEach(a => auditLogEntries.push({
                    action: "added",
                    property: a,
                    before: null,
                    after: currentValue[a]
                }));
                deltas.changed.forEach(c => auditLogEntries.push({
                    action: "updated",
                    property: c,
                    before: priorValue[c],
                    after: currentValue[c]
                }));
                const removed = deltas.removed.forEach(r => auditLogEntries.push({
                    action: "removed",
                    property: r,
                    before: priorValue[r],
                    after: null
                }));
                const pastTense = {
                    add: "added",
                    update: "updated",
                    remove: "removed"
                };
                await Audit_1.writeAudit(this.id, this.pluralName, pastTense[action], auditLogEntries, { db: this.db });
            }
        }
        catch (e) {
            throw new errors_1.FireModelProxyError(e);
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
        options = Object.assign({ silent: false, silentAcceptance: false }, options);
        const transactionId = "t-" +
            Math.random()
                .toString(36)
                .substr(2, 5) +
            "-" +
            Math.random()
                .toString(36)
                .substr(2, 5);
        const lookup = {
            add: [
                index_1.FmEvents.RECORD_ADDED_LOCALLY,
                index_1.FmEvents.RECORD_ADDED_CONFIRMATION,
                index_1.FmEvents.RECORD_ADDED_ROLLBACK
            ],
            update: [
                index_1.FmEvents.RECORD_CHANGED_LOCALLY,
                index_1.FmEvents.RECORD_CHANGED_CONFIRMATION,
                index_1.FmEvents.RECORD_CHANGED_ROLLBACK
            ],
            remove: [
                index_1.FmEvents.RECORD_REMOVED_LOCALLY,
                index_1.FmEvents.RECORD_REMOVED_CONFIRMATION,
                index_1.FmEvents.RECORD_REMOVED_ROLLBACK
            ]
        };
        const [actionTypeStart, actionTypeEnd, actionTypeFailure] = lookup[crudAction];
        this.isDirty = true;
        // Set aside prior value
        const { changed, added, removed } = util_1.compareHashes(util_1.withoutMetaOrPrivate(this.data), util_1.withoutMetaOrPrivate(priorValue));
        const watchers = findWatchers_1.findWatchers(this.dbPath);
        const event = {
            transactionId,
            modelConstructor: this.modelConstructor,
            kind: "record",
            operation: crudAction,
            eventType: "local",
            key: this.id,
            value: util_1.withoutMetaOrPrivate(this.data),
            priorValue
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
                await this.dispatch(UnwatchedLocalEvent_1.UnwatchedLocalEvent(this, Object.assign({ type: actionTypeStart }, event, { value: util_1.withoutMetaOrPrivate(this.data) })));
            }
        }
        else {
            // For each watcher watching this DB path ...
            const dispatch = WatchDispatcher_1.WatchDispatcher(this.dispatch);
            for (const watcher of watchers) {
                if (!options.silent) {
                    await dispatch(watcher)(Object.assign({ type: actionTypeStart }, event));
                }
            }
        }
        // Send CRUD to Firebase
        try {
            if (this.db.isMockDb && options.silent) {
                this.db.mock.silenceEvents();
            }
            this._data.lastUpdated = new Date().getTime();
            const path = this.dbPath;
            switch (crudAction) {
                case "remove":
                    await this.db.remove(this.dbPath);
                    break;
                case "add":
                    await this.db.set(path, this.data);
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
                    await this.dispatch(UnwatchedLocalEvent_1.UnwatchedLocalEvent(this, Object.assign({ type: actionTypeEnd }, event, { transactionId, value: util_1.withoutMetaOrPrivate(this.data) })));
                }
                else {
                    const dispatch = WatchDispatcher_1.WatchDispatcher(this.dispatch);
                    for (const watcher of watchers) {
                        if (!options.silent) {
                            await dispatch(watcher)(Object.assign({ type: actionTypeEnd }, event));
                        }
                    }
                }
            }
            if (this.db.isMockDb && options.silent) {
                this.db.mock.restoreEvents();
            }
        }
        catch (e) {
            // send failure event
            await this.dispatch(UnwatchedLocalEvent_1.UnwatchedLocalEvent(this, Object.assign({ type: actionTypeFailure }, event, { transactionId, value: util_1.withoutMetaOrPrivate(this.data) })));
            throw new DatabaseCrudFailure_1.RecordCrudFailure(this, crudAction, transactionId, e);
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
        this.dynamicPathComponents.forEach(prop => {
            const value = this.data[prop];
            if (value ? false : true) {
                throw common_types_1.createError("record/not-ready", `You can not ask for the ${forProp} on a model like "${this.modelName}" which has a dynamic property of "${prop}" before setting that property [ id: ${this.id} ].`);
            }
            if (!["string", "number"].includes(typeof value)) {
                throw common_types_1.createError("record/not-allowed", `The path is using the property "${prop}" on ${this.modelName} as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`);
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
            ? createCompositeKeyFromFkString_1.createCompositeKeyFromFkString(id, this.modelConstructor)
            : id;
        // load composite key into props so the dbPath() will evaluate
        Object.keys(keys).map(key => {
            // TODO: fix up typing
            this._data[key] = keys[key];
        });
        const data = await this.db.getRecord(this.dbPath);
        if (data && data.id) {
            await this._initialize(data);
        }
        else {
            throw new errors_1.FireModelError(`Failed to load the Record "${this.modelName}::${this.id}" with composite key of:\n ${JSON.stringify(keys, null, 2)}`, "firebase/invalid-composite-key");
        }
        return this;
    }
    /**
     * Allows for the static "add" method to add a record
     */
    async _adding(options) {
        if (!this.id) {
            this.id = firebase_key_1.key();
        }
        const now = new Date().getTime();
        if (!this.get("createdAt")) {
            this._data.createdAt = now;
        }
        this._data.lastUpdated = now;
        if (!this.db) {
            throw new errors_1.FireModelError(`Attempt to save Record failed as the Database has not been connected yet. Try setting FireModel's defaultDb first.`, "firemodel/db-not-ready");
        }
        await this._localCrudOperation("add" /* add */, undefined, options);
        return this;
    }
}
exports.Record = Record;
//# sourceMappingURL=Record.js.map