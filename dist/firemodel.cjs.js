'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('reflect-metadata');
var lodash = require('lodash');
var serializedQuery = require('serialized-query');
var waitInParallel = require('wait-in-parallel');
var commonTypes = require('common-types');
var firebaseKey = require('firebase-key');
var abstractedFirebase = require('abstracted-firebase');

function push(target, path, value) {
    if (Array.isArray(lodash.get(target, path))) {
        lodash.get(target, path).push(value);
    }
    else {
        lodash.set(target, path, [value]);
    }
}
/** Properties accumlated by propertyDecorators  */
const propertiesByModel = {};
/** Relationships accumlated by hasMany/ownedBy decorators */
const relationshipsByModel = {};
const propertyDecorator = (nameValuePairs = {}, 
/**
 * if you want to set the property being decorated's name
 * as property on meta specify the meta properties name here
 */
property) => (target, key) => {
    const reflect = Reflect.getMetadata("design:type", target, key) || {};
    const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
    Reflect.defineMetadata(key, meta, target);
    if (nameValuePairs.isProperty) {
        if (property) {
            push(propertiesByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(propertiesByModel, target.constructor.name, meta);
        }
    }
    if (nameValuePairs.isRelationship) {
        if (property) {
            push(relationshipsByModel, target.constructor.name, Object.assign({}, meta, { [property]: key }));
        }
        else {
            push(relationshipsByModel, target.constructor.name, meta);
        }
    }
};
/**
 * Gets all the properties for a given model
 *
 * @param target the schema object which is being looked up
 */
function getProperties(target) {
    return [
        ...propertiesByModel[target.constructor.name],
        ...propertiesByModel.Model.map(s => (Object.assign({}, s, { isModel: true })))
    ];
}
/**
 * Gets all the relationships for a given model
 */
function getRelationships(target) {
    return relationshipsByModel[target.constructor.name];
}
function getPushKeys(target) {
    const props = getProperties(target);
    return props.filter(p => p.pushKey).map(p => p.property);
}

function constrainedProperty(options = {}) {
    return propertyDecorator(Object.assign({}, options, { isRelationship: false, isProperty: true }), "property");
}
/** allows the introduction of a new constraint to the metadata of a property */
function constrain(prop, value) {
    return propertyDecorator({ [prop]: value });
}
function desc(value) {
    return propertyDecorator({ desc: value });
}
function min(value) {
    return propertyDecorator({ min: value });
}
function mock(value) {
    return propertyDecorator({ mockType: value });
}
function max(value) {
    return propertyDecorator({ max: value });
}
function length(value) {
    return propertyDecorator({ length: value });
}
const property = propertyDecorator({
    isRelationship: false,
    isProperty: true
}, "property");
const pushKey = propertyDecorator({
    pushKey: true
}, "property");

const meta = {};
function addModelMeta(modelName, props) {
    meta[modelName] = props;
}
function getModelMeta(modelName) {
    return meta[modelName] || {};
}

// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
const defaultDispatch = (context) => "";
class FireModel {
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
        const coreMeta = this._model.META;
        const storedMeta = getModelMeta(this.modelName);
        return Object.assign({}, storedMeta, coreMeta);
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
    _getPaths(changes) {
        return Object.keys(changes).reduce((prev, current) => {
            const path = current;
            const value = changes[current];
            return [].concat(prev, [{ path, value }]);
        }, []);
    }
}
//#region STATIC INTERFACE
FireModel.auditLogs = "/auditing";
FireModel._defaultDb = null;
FireModel._dispatchActive = false;
/** the dispatch function used to interact with frontend frameworks */
FireModel._dispatch = defaultDispatch;

/** Enumeration of all Firemodel Actions that will be fired */
var FMEvents;
(function (FMEvents) {
    /** A record has been added locally */
    FMEvents["RECORD_ADDED_LOCALLY"] = "@firemodel/RECORD_ADDED_LOCALLY";
    /** A record has been added to a given Model list being watched */
    FMEvents["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    /** A record has been updated locally */
    FMEvents["RECORD_CHANGED_LOCALLY"] = "@firemodel/RECORD_CHANGED_LOCALLY";
    /** A record has been updated on Firebase */
    FMEvents["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    /** for client originated events touching relationships (as external events would come back as an event per model) */
    FMEvents["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    /** A record has been removed from a given Model list being watched */
    FMEvents["RECORD_REMOVED_LOCALLY"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** A record has been removed from a given Model list being watched */
    FMEvents["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** Watcher has established connection with Firebase */
    FMEvents["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
    /** Watcher has disconnected an event stream from Firebase */
    FMEvents["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
    /** Watcher has disconnected all event streams from Firebase */
    FMEvents["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
    /** Relationship(s) have removed */
    FMEvents["RELATIONSHIP_REMOVED"] = "@firemodel/RELATIONSHIP_REMOVED";
    /** Relationship(s) have been removed locally */
    FMEvents["RELATIONSHIP_REMOVED_LOCALLY"] = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY";
    /** Relationship(s) have added */
    FMEvents["RELATIONSHIP_ADDED"] = "@firemodel/RELATIONSHIP_ADDED";
    /** Relationship(s) have been added locally */
    FMEvents["RELATIONSHIP_ADDED_LOCALLY"] = "@firemodel/RELATIONSHIP_ADDED_LOCALLY";
    FMEvents["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
    FMEvents["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
})(FMEvents || (FMEvents = {}));
//#endregion
//#region specific events
//#endregion

const moreThanThreePeriods = /\.{3,}/g;
// polyfill Array.isArray if necessary
if (!Array.isArray) {
    Array.isArray = (arg) => {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}
const errorStr = "tried to join something other than a string or array, it was ignored in pathJoin's result";
/** An ISO-morphic path join that works everywhere */
function pathJoin(...args) {
    return args
        .reduce((prev, val) => {
        if (typeof prev === "undefined") {
            return;
        }
        return typeof val === "string" || typeof val === "number"
            ? joinStringsWithSlash(prev, "" + val) // if string or number just keep as is
            : Array.isArray(val)
                ? joinStringsWithSlash(prev, pathJoin.apply(null, val)) // handle array with recursion
                : (console.error ? console.error(errorStr) : console.log(errorStr)) ||
                    "";
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

async function writeAudit(recordId, pluralName, action, changes, options = {}) {
    const db = options.db || FireModel.defaultDb;
    const timestamp = new Date().getTime();
    const writePath = pathJoin(FireModel.auditLogs, pluralName);
    const p = new waitInParallel.Parallel();
    const createdAt = new Date().getTime();
    const auditId = firebaseKey.key();
    p.add("audit-log-item", db.set(pathJoin(writePath, "all", auditId), {
        createdAt,
        recordId,
        timestamp,
        action,
        changes
    }));
    const mps = db.multiPathSet(pathJoin(writePath, "byId", recordId));
    mps.add({ path: pathJoin("all", auditId), value: createdAt });
    changes.map(change => {
        mps.add({
            path: pathJoin("props", change.property, auditId),
            value: createdAt
        });
    });
    p.add("byId", mps.execute());
    await p.isDone();
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
            action: propertyAction
        };
        prev.push(payload);
        return prev;
    }, []);
}

class Record extends FireModel {
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
            await r._adding();
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
    /**
     * Goes out to the database and reloads this record
     */
    async reload() {
        const reloaded = await Record.get(this._modelConstructor, this.id);
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
    async addAnother(payload) {
        const newRecord = await Record.add(this._modelConstructor, payload);
        return newRecord;
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
        if (!this.data.id) {
            throw commonTypes.createError("record/invalid-path", `Invalid Record Path: you can not ask for the dbPath before setting an "id" property.`);
        }
        const coreMeta = this.data.META;
        const meta = getModelMeta(this.modelName);
        return [
            coreMeta.dbOffset || meta.dbOffset,
            this.pluralName,
            this.data.id
        ].join("/");
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
        return this.data.META
            ? this.data.META.dbOffset
            : getModelMeta(this.modelName).dbOffset;
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
        const relationships = this.META
            ? this.META.relationships
            : getModelMeta(this._modelConstructor.constructor.name.toLowerCase())
                .relationships;
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
            throw commonTypes.createError("invalid-operation/not-pushkey", `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`);
        }
        if (!this.existsOnDB) {
            throw commonTypes.createError("invalid-operation/not-on-db", `Invalid Operation: you can not push to property "${property}" before saving the record to the database`);
        }
        const key = firebaseKey.key();
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
            throw commonTypes.createError("multi-path/write-error", "", e);
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
        if (this.META.audit === true) {
            this._writeAudit("removed", []);
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
        if (this.META.audit) ;
        return;
    }
    /**
     * Adds one or more fk's to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param refs FK reference (or array of FKs) that should be added to reln
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */
    async addToRelationship(property, refs, optionalValue = true) {
        this._errorIfNotHasManyReln(property, "addToRelationship");
        if (!Array.isArray(refs)) {
            refs = [refs];
        }
        const now = new Date().getTime();
        const mps = this.db.multiPathSet("/");
        refs.map(ref => {
            this._relationshipMPS(mps, ref, property, optionalValue, now);
        });
        mps.add({ path: pathJoin(this.dbPath, "lastUpdated"), value: now });
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED_LOCALLY, mps.payload));
        await mps.execute();
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_ADDED, this.data));
    }
    /**
     * removeFromRelationship
     *
     * remove one or more IDs from a hasMany relationship
     *
     * @param property the property which is acting as a FK
     * @param refs the IDs on the properties FK which should be removed
     */
    async removeFromRelationship(property, refs) {
        this._errorIfNotHasManyReln(property, "removeFromRelationship");
        if (!Array.isArray(refs)) {
            refs = [refs];
        }
        const now = new Date().getTime();
        const mps = this.db.multiPathSet("/");
        const inverseProperty = this.META.property(property).inverseProperty;
        mps.add({ path: pathJoin(this.dbPath, "lastUpdated"), value: now });
        refs.map(ref => {
            this._relationshipMPS(mps, ref, property, null, now);
        });
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED_LOCALLY, mps.payload));
        await mps.execute();
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED, this.data));
    }
    /**
     * clearRelationship
     *
     * clears an existing FK on a ownedBy relationship
     *
     * @param property the property containing the ownedBy FK
     */
    async clearRelationship(property) {
        this._errorIfNotOwnedByReln(property, "clearRelationship");
        if (!this.get(property)) {
            console.warn(`Call to clearRelationship(${property}) on model ${this.modelName} but there was no relationship set. This may be ok.`);
            return;
        }
        const mps = this.db.multiPathSet("/");
        this._relationshipMPS(mps, this.get(property), property, null, new Date().getTime());
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED_LOCALLY, mps.payload));
        await mps.execute();
        this.dispatch(this._createRecordEvent(this, FMEvents.RELATIONSHIP_REMOVED, this.data));
    }
    /**
     * setRelationship
     *
     * sets up an ownedBy FK relationship
     *
     * @param property the property containing the ownedBy FK
     * @param ref the FK
     */
    async setRelationship(property, ref, optionalValue = true) {
        this._errorIfNotOwnedByReln(property, "setRelationship");
        const mps = this.db.multiPathSet("/");
        this._relationshipMPS(mps, ref, property, optionalValue, new Date().getTime());
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
    _writeAudit(action, changes, options = {}) {
        if (!changes || changes.length === 0) {
            changes = [];
            this.META.properties.map(p => {
                if (this.data[p.property]) {
                    changes.push({
                        before: undefined,
                        after: this.data[p.property],
                        property: p.property,
                        action: "added"
                    });
                }
            });
        }
        writeAudit(this.id, this.pluralName, action, changes, Object.assign({}, options, { db: this.db }));
    }
    /**
     * _relationshipMPS
     *
     * @param mps the multi-path selection object
     * @param ref the FK reference
     * @param property the property on the target record which contains FK(s)
     * @param value the value to set this FK (null removes)
     * @param now the current time in miliseconds
     */
    _relationshipMPS(mps, ref, property, value, now) {
        const isHasMany = this.META.property(property).relType === "hasMany";
        const pathToThisFkReln = pathJoin(this.dbPath, property, isHasMany ? ref : "");
        const inverseProperty = this.META.property(property).inverseProperty;
        const fkRecord = Record.create(this.META.property(property).fkConstructor);
        mps.add({ path: pathToThisFkReln, value: isHasMany ? value : ref });
        // INVERSE RELATIONSHIP
        if (inverseProperty) {
            const fkMeta = getModelMeta(fkRecord.modelName);
            const fkInverseHasRecipricalInverse = fkMeta.relationship(inverseProperty).inverseProperty === property;
            if (!fkInverseHasRecipricalInverse) {
                console.warn(`The FK "${property}" on ${this.modelName} has an inverse property set of "${inverseProperty}" but on the reference model [ ${fkRecord.modelName} ] there is NOT a reciprocal inverse set! [ ${fkMeta.relationship(inverseProperty).inverseProperty
                    ? fkMeta.relationship(inverseProperty).inverseProperty +
                        " was set instead"
                    : "no inverse set"} ]`);
            }
            const pathToInverseFkReln = inverseProperty
                ? pathJoin(fkMeta.dbOffset, fkRecord.pluralName, ref, inverseProperty)
                : null;
            const fkInverseIsHasManyReln = inverseProperty
                ? fkMeta.relationship(inverseProperty).relType === "hasMany"
                : false;
            mps.add({
                path: fkInverseIsHasManyReln
                    ? pathJoin(pathToInverseFkReln, this.id)
                    : pathToInverseFkReln,
                value: fkInverseIsHasManyReln
                    ? value // can be null for removal
                    : value === null
                        ? null
                        : this.id
            });
            mps.add({
                path: pathJoin(fkMeta.dbOffset, fkRecord.pluralName, ref, "lastUpdated"),
                value: now
            });
        }
        if (typeof this.data[property] === "object" &&
            this.data[property][ref]) {
            console.warn(`The fk of "${ref}" already exists in "${this.modelName}.${property}"!`);
            return;
        }
    }
    _errorIfNotOwnedByReln(property, fn) {
        if (this.META.property(property).relType !== "ownedBy") {
            const e = new Error(`Can not use property "${property}" on ${this.modelName} with ${fn}() because it is not a ownedBy relationship [ relType: ${this.META.property(property).relType}, inverse: ${this.META.property(property).inverse} ]. If you are working with a hasMany relationship then you should instead use addRelationship() and removeRelationship().`);
            e.name = "FireModel::WrongRelationshipType";
            throw e;
        }
    }
    _errorIfNotHasManyReln(property, fn) {
        if (this.META.property(property).relType !== "hasMany") {
            const e = new Error(`Can not use property "${property}" on ${this.modelName} with ${fn}() because it is not a hasMany relationship [ relType: ${this.META.property(property).relType}, inverse: ${this.META.property(property).inverse} ]. If you are working with a ownedBy relationship then you should instead use setRelationship() and clearRelationship().`);
            e.name = "FireModel::WrongRelationshipType";
            throw e;
        }
    }
    async _updateProps(actionTypeStart, actionTypeEnd, changed) {
        this.isDirty = true;
        const priorValues = {};
        Object.keys(changed).map((prop) => {
            priorValues[prop] = this._data[prop];
            this._data[prop] = changed[prop];
        });
        const paths = this._getPaths(changed);
        this.dispatch(this._createRecordEvent(this, actionTypeStart, paths));
        const mps = this.db.multiPathSet(this.dbPath);
        paths.map(path => mps.add(path));
        await mps.execute();
        this.isDirty = false;
        this._data.lastUpdated = new Date().getTime();
        if (this.META.audit === true) {
            const action = Object.keys(priorValues).every((i) => !priorValues[i])
                ? "added"
                : "updated";
            const changes = Object.keys(changed).reduce((prev, curr) => {
                const after = changed[curr];
                const before = priorValues[curr];
                const propertyAction = !before
                    ? "added"
                    : !after
                        ? "removed"
                        : "updated";
                const payload = {
                    before,
                    after,
                    property: curr,
                    action: propertyAction
                };
                prev.push(payload);
                return prev;
            }, []);
            writeAudit(this.id, this.pluralName, action, updateToAuditChanges(changed, priorValues), { db: this.db });
        }
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
    async _adding() {
        if (!this.id) {
            this.id = firebaseKey.key();
        }
        if (this.META.audit === true) {
            this._writeAudit("added", []);
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
            this.dispatch(this._createRecordEvent(this, FMEvents.RECORD_ADDED, this.data));
        }
        return this;
    }
}

function hasMany(modelConstructor) {
    const rec = Record.create(modelConstructor);
    let meta = {};
    if (rec.META) {
        addModelMeta(rec.modelName, rec.META);
        meta = rec.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "hasMany",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName,
        fkPluralName: rec.pluralName
    };
    return propertyDecorator(payload, "property");
}
function ownedBy(modelConstructor) {
    const rec = Record.create(modelConstructor);
    let meta;
    if (rec.META) {
        addModelMeta(rec.modelName, rec.META);
        meta = rec.META;
    }
    const payload = {
        isRelationship: true,
        isProperty: false,
        relType: "ownedBy",
        fkConstructor: modelConstructor,
        fkModelName: rec.modelName
    };
    return propertyDecorator(payload, "property");
}
function inverse(inverseProperty) {
    return propertyDecorator({ inverseProperty });
}

/** lookup meta data for schema properties */
function getModelProperty(modelKlass) {
    return (prop) => Reflect.getMetadata(prop, modelKlass);
}
function getModelRelationship(relationships) {
    return (relnProp) => relationships.find(i => relnProp === i.property);
}
function model(options) {
    let isDirty = false;
    return (target) => {
        const original = target;
        // new constructor
        const f = function (...args) {
            const obj = Reflect.construct(original, args);
            if (options.audit === undefined) {
                options.audit = false;
            }
            if (!(options.audit === true ||
                options.audit === false ||
                options.audit === "server")) {
                console.warn(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
                options.audit = false;
            }
            const payload = Object.assign({}, options, { property: getModelProperty(obj) }, { properties: getProperties(obj) }, { relationship: getModelRelationship(getRelationships(obj)) }, { relationships: getRelationships(obj) }, { pushKeys: getPushKeys(obj) }, { dbOffset: options.dbOffset ? options.dbOffset : "" }, { audit: options.audit ? options.audit : false }, { isDirty });
            addModelMeta(obj.constructor.name.toLowerCase(), payload);
            Reflect.defineProperty(obj, "META", {
                get() {
                    return payload;
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
                enumerable: false
            });
            return obj;
        };
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;
        // return new constructor (will override original)
        return f;
    };
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
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

(function (RelationshipPolicy) {
    RelationshipPolicy["keys"] = "keys";
    RelationshipPolicy["lazy"] = "lazy";
    RelationshipPolicy["inline"] = "inline";
})(exports.RelationshipPolicy || (exports.RelationshipPolicy = {}));
(function (RelationshipCardinality) {
    RelationshipCardinality["hasMany"] = "hasMany";
    RelationshipCardinality["belongsTo"] = "belongsTo";
})(exports.RelationshipCardinality || (exports.RelationshipCardinality = {}));
class Model {
}
__decorate([
    property,
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
__decorate([
    property,
    mock("dateRecentMiliseconds"),
    __metadata("design:type", Number)
], Model.prototype, "lastUpdated", void 0);
__decorate([
    property,
    mock("datePastMiliseconds"),
    __metadata("design:type", Number)
], Model.prototype, "createdAt", void 0);

const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
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
    }
    //#region STATIC Interfaces
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    static get defaultDb() {
        return FireModel.defaultDb;
    }
    static set dispatch(fn) {
        FireModel.dispatch = fn;
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
        return list;
    }
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */
    static async all(model, options = {}) {
        const query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated");
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
        const query = new serializedQuery.SerializedQuery()
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
        const query = new serializedQuery.SerializedQuery()
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
        const query = new serializedQuery.SerializedQuery()
            .orderByChild("lastUpdated")
            .startAt(since);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    static async inactive(model, howMany, options = {}) {
        const query = new serializedQuery.SerializedQuery()
            .orderByChild("lastUpdated")
            .limitToLast(howMany);
        const list = await List.fromQuery(model, query, options);
        return list;
    }
    static async last(model, howMany, options = {}) {
        const query = new serializedQuery.SerializedQuery()
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
        const query = new serializedQuery.SerializedQuery()
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
        return [this.META.localOffset, this.pluralName].join("/");
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
    /**
     * findWhere
     *
     * returns the first record in the list where the property equals the
     * specified value. If no value is found then an error is thrown unless
     * it is stated
     */
    findWhere(prop, value, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
        const list = this.META.property(prop).relType !== "hasMany"
            ? this.filterWhere(prop, value)
            : this.filter(i => Object.keys(i[prop]).includes(value));
        if (list.length > 0) {
            return Record.createWith(this._modelConstructor, list._data[0]);
        }
        else {
            if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                return defaultIfNotFound;
            }
            else {
                const e = new Error(`findWhere(${prop}, ${value}) was not found in the List [ length: ${this.data.length} ]`);
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
        const r = Record.create(this._modelConstructor);
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
        const removed = await Record.remove(this._modelConstructor, id, rec);
        this._data = this.filter(f => f.id !== id).data;
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
    getData(id, defaultIfNotFound = "__DO_NOT_USE__") {
        const record = this.findById(id, defaultIfNotFound);
        return record === defaultIfNotFound
            ? defaultIfNotFound
            : record.data;
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

// tslint:disable-next-line:no-implicit-dependencies
function fakeIt(helper, type) {
    switch (type) {
        case "id":
            return firebaseKey.key();
        case "String":
            return helper.faker.lorem.words(5);
        case "Number":
            return Math.round(Math.random() * 100);
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
            return helper.faker.company.companyName();
        case "address":
            return (helper.faker.address.secondaryAddress() +
                ", " +
                helper.faker.address.city() +
                ", " +
                helper.faker.address.stateAbbr() +
                "  " +
                helper.faker.address.zipCode());
        case "streetName":
            return helper.faker.address.streetName();
        case "streetAddress":
            return helper.faker.address.streetAddress();
        case "city":
            return helper.faker.address.city();
        case "state":
            return helper.faker.address.state();
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
        case "gender":
            return helper.faker.helpers.shuffle(["male", "female", "other"]);
        case "date":
        case "dateRecent":
            return helper.faker.date.recent();
        case "dateMiliseconds":
        case "dateRecentMiliseconds":
            return helper.faker.date.recent().getTime();
        case "datePast":
            return helper.faker.date.past();
        case "datePastMiliseconds":
            return helper.faker.date.past().getTime();
        case "dateFuture":
            return helper.faker.date.future();
        case "dateFutureMiliseconds":
            return helper.faker.date.future().getTime();
        case "dateSoon":
            return helper.faker.date.soon();
        case "dateSoonMiliseconds":
            return helper.faker.date.soon().getTime();
        case "image":
        case "avatar":
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
        default:
            return helper.faker.lorem.slug();
    }
}
function mockValue(db, propMeta) {
    if (!db || !(db instanceof abstractedFirebase.RealTimeDB)) {
        const e = new Error(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db} ].`);
        e.name = "FireModel::NotReady";
        throw e;
    }
    const helper = db.mock.getMockHelper();
    const { type, mockType } = propMeta;
    if (mockType) {
        return typeof mockType === "function"
            ? mockType(helper)
            : fakeIt(helper, mockType);
    }
    else {
        const namePatterns = {
            id: "id",
            name: "name",
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
            avatar: "avatar",
            phone: "phoneNumber",
            phoneNumber: "phoneNumber"
        };
        return fakeIt(helper, Object.keys(namePatterns).includes(propMeta.property)
            ? namePatterns[propMeta.property]
            : type);
    }
}
/** adds mock values for all the properties on a given model */
function mockProperties(db, config, exceptions) {
    return async (instance) => {
        const meta = getModelMeta(instance.modelName);
        const props = instance.META ? instance.META.properties : meta.properties;
        const recProps = {};
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        instance = await instance.addAnother(finalized);
        return instance;
    };
}
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}
function addRelationships(db, config, exceptions) {
    return async (instance) => {
        const meta = getModelMeta(instance.modelName);
        const relns = meta && meta.relationships
            ? meta.relationships
            : instance.META.relationships;
        const p = new waitInParallel.Parallel();
        if (!relns || config.relationshipBehavior === "ignore") {
            return instance;
        }
        const follow = config.relationshipBehavior === "follow";
        relns.map(rel => {
            if (!config.cardinality ||
                Object.keys(config.cardinality).includes(rel.property)) {
                if (rel.relType === "ownedBy") {
                    const id = firebaseKey.key();
                    const prop = rel.property;
                    p.add(`ownedBy-${id}`, follow
                        ? instance.setRelationship(prop, id)
                        : db.set(pathJoin(instance.dbPath, prop), id));
                }
                else {
                    const cardinality = config.cardinality
                        ? typeof config.cardinality[rel.property] === "number"
                            ? config.cardinality[rel.property]
                            : NumberBetween(config.cardinality[rel.property])
                        : 2;
                    for (let i = 0; i < cardinality; i++) {
                        const id = firebaseKey.key();
                        const prop = rel.property;
                        p.add(`hasMany-${id}`, follow
                            ? instance.addToRelationship(prop, id)
                            : db.set(pathJoin(instance.dbPath, prop, id), true));
                    }
                }
            }
        });
        await p.isDone();
        instance = await instance.reload();
        return instance;
    };
}
/** adds models to mock DB which were pointed to by original model's FKs */
function followRelationships(db, config, exceptions) {
    return async (instance) => {
        const p = new waitInParallel.Parallel();
        const relns = instance.META
            ? instance.META.relationships
            : getModelMeta(instance.modelName).relationships;
        if (!relns || config.relationshipBehavior !== "follow") {
            return instance;
        }
        const hasMany$$1 = relns.filter(i => i.relType === "hasMany");
        const ownedBy$$1 = relns.filter(i => i.relType === "ownedBy");
        hasMany$$1.map(r => {
            const fks = Object.keys(instance.get(r.property));
            fks.map(fk => {
                p.add(fk, Mock$$1(r.fkConstructor, db).generate(1, { id: fk }));
            });
        });
        ownedBy$$1.map(r => {
            const fk = instance.get(r.property);
            p.add(fk, Mock$$1(r.fkConstructor, db).generate(1, { id: fk }));
        });
        await p.isDone();
        return instance;
    };
}
function Mock$$1(modelConstructor, db) {
    const record = Record.create(modelConstructor);
    const config = { relationshipBehavior: "ignore" };
    const API = {
        /**
         * generate
         *
         * Populates the mock database with values for a given model passed in.
         *
         * @param count how many instances of the given Model do you want?
         * @param exceptions do you want to fix a given set of properties to a static value?
         */
        async generate(count, exceptions) {
            const props = mockProperties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            const follow = followRelationships(db, config, exceptions);
            const p = new waitInParallel.Parallel();
            for (let i = 0; i < count; i++) {
                const rec = Record.create(modelConstructor);
                p.add(`record-${i}`, follow(await relns(await props(rec))));
            }
            await p.isDone();
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
            return API;
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
            return API;
        }
    };
    return API;
}

exports.fbKey = firebaseKey.key;
exports.property = property;
exports.pushKey = pushKey;
exports.constrainedProperty = constrainedProperty;
exports.constrain = constrain;
exports.min = min;
exports.max = max;
exports.length = length;
exports.desc = desc;
exports.mock = mock;
exports.hasMany = hasMany;
exports.ownedBy = ownedBy;
exports.inverse = inverse;
exports.model = model;
exports.Model = Model;
exports.Record = Record;
exports.List = List;
exports.Mock = Mock$$1;
//# sourceMappingURL=firemodel.cjs.js.map
