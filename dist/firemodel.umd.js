(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('reflect-metadata'), require('lodash'), require('common-types'), require('pluralize'), require('serialized-query'), require('firebase-key')) :
    typeof define === 'function' && define.amd ? define(['exports', 'reflect-metadata', 'lodash', 'common-types', 'pluralize', 'serialized-query', 'firebase-key'], factory) :
    (factory((global.FireModel = {}),null,global.lodash,global.commonTypes,global.pluralize,global.serializedQuery,global.firebaseKey));
}(this, (function (exports,reflectMetadata,lodash,commonTypes,pluralize,serializedQuery,firebaseKey) { 'use strict';

    function push(target, path, value) {
        if (Array.isArray(lodash.get(target, path))) {
            lodash.get(target, path).push(value);
        }
        else {
            lodash.set(target, path, [value]);
        }
    }
    /** Properties accumlated by propertyDecorators and grouped by schema */
    const propertiesBySchema = {};
    /** Relationships accumlated by propertyDecorators and grouped by schema */
    const relationshipsBySchema = {};
    const propertyDecorator = (nameValuePairs = {}, 
    /**
     * if you want to set the property being decorated's name
     * as property on meta specify the meta properties name here
     */
    property) => (target, key) => {
        const reflect = Reflect.getMetadata("design:type", target, key) || {};
        const meta = Object.assign({}, Reflect.getMetadata(key, target), { type: reflect.name }, nameValuePairs);
        Reflect.defineMetadata(key, meta, target);
        const _val = undefined[key];
        if (nameValuePairs.isProperty) {
            if (property) {
                push(propertiesBySchema, target.constructor.name, Object.assign({}, meta, { [property]: key }));
            }
            else {
                push(propertiesBySchema, target.constructor.name, meta);
            }
        }
        if (nameValuePairs.isRelationship) {
            if (property) {
                push(relationshipsBySchema, target.constructor.name, Object.assign({}, meta, { [property]: key }));
            }
            else {
                push(relationshipsBySchema, target.constructor.name, meta);
            }
        }
        // Reflect.defineProperty(target, key, {
        //   get: () => {
        //     return this[key];
        //   },
        //   set: (value: any) => {
        //     this[key] = value;
        //   },
        //   enumerable: true,
        //   configurable: true
        // });
    };
    /**
     * Give all properties from schema and base schema
     *
     * @param target the schema object which is being looked up
     */
    function getProperties(target) {
        return [
            ...propertiesBySchema[target.constructor.name],
            ...propertiesBySchema.BaseSchema.map(s => (Object.assign({}, s, { isBaseSchema: true })))
        ];
    }
    function getRelationships(target) {
        return relationshipsBySchema[target.constructor.name];
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

    function hasMany(schemaClass) {
        return propertyDecorator({
            isRelationship: true,
            isProperty: false,
            relType: 'hasMany'
        }, 'property');
    }
    function ownedBy(schemaClass) {
        return propertyDecorator({
            isRelationship: true,
            isProperty: false,
            relType: 'ownedBy'
        }, 'property');
    }
    function inverse(inverseProperty) {
        return propertyDecorator({ inverseProperty });
    }

    /** lookup meta data for schema properties */
    function propertyMeta$1(context) {
        return (prop) => Reflect.getMetadata(prop, context);
    }
    function schema(options) {
        return (target) => {
            const original = target;
            // new constructor
            const f = function (...args) {
                const obj = Reflect.construct(original, args);
                Reflect.defineProperty(obj, "META", {
                    get() {
                        return Object.assign({}, options, { property: propertyMeta$1(obj) }, { properties: getProperties(obj) }, { relationships: getRelationships(obj) }, { pushKeys: getPushKeys(obj) }, { audit: options.audit ? options.audit : false });
                    },
                    set() {
                        throw new Error("The meta property can only be set with the @schema decorator!");
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

    var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc$$1) {
        var c = arguments.length, r = c < 3 ? target : desc$$1 === null ? desc$$1 = Object.getOwnPropertyDescriptor(target, key) : desc$$1, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc$$1);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (undefined && undefined.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    (function (RelationshipPolicy) {
        RelationshipPolicy["keys"] = "keys";
        RelationshipPolicy["lazy"] = "lazy";
        RelationshipPolicy["inline"] = "inline";
    })(exports.RelationshipPolicy || (exports.RelationshipPolicy = {}));
    (function (RelationshipCardinality) {
        RelationshipCardinality["hasMany"] = "hasMany";
        RelationshipCardinality["belongsTo"] = "belongsTo";
    })(exports.RelationshipCardinality || (exports.RelationshipCardinality = {}));
    class BaseSchema {
        toString() {
            const obj = {};
            this.META.properties.map(p => {
                obj[p.property] = this[p.property];
            });
            return JSON.stringify(obj);
        }
    }
    __decorate([
        property,
        __metadata("design:type", String)
    ], BaseSchema.prototype, "id", void 0);
    __decorate([
        property,
        __metadata("design:type", Number)
    ], BaseSchema.prototype, "lastUpdated", void 0);
    __decorate([
        property,
        __metadata("design:type", Number)
    ], BaseSchema.prototype, "createdAt", void 0);

    let chalk;
    class VerboseError extends Error {
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

    function normalized(...args) {
        return args
            .filter(a => a)
            .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
            .map(a => a.replace(/\./g, "/"));
    }
    function slashNotation(...args) {
        return normalized(...args).join("/");
    }

    const baseLogger = {
        log: (message) => console.log(`${undefined.modelName}/${undefined._key}: ${message}`),
        warn: (message) => console.warn(`${undefined.modelName}/${undefined._key}: ${message}`),
        debug: (message) => {
            const stage = process.env.STAGE || process.env.AWS_STAGE || process.env.ENV;
            if (stage !== "prod") {
                console.log(`${undefined.modelName}/${undefined._key}: ${message}`);
            }
        },
        error: (message) => console.error(`${undefined.modelName}/${undefined._key}: ${message}`)
    };
    class Model$$1 {
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
            if (!Model$$1.defaultDb) {
                Model$$1.defaultDb = db;
            }
            this.logger = logger ? logger : baseLogger;
            this._schema = new this.schemaClass();
        }
        static create(schema$$1, options = {}) {
            const db = options.db || Model$$1.defaultDb;
            const logger = options.logger || baseLogger;
            const model = new Model$$1(schema$$1, db, logger);
            return model;
        }
        /** the singular name of the model */
        get modelName() {
            return lodash.camelCase(this._schema.constructor.name);
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
            const list = new List$$1(this);
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
                throw commonTypes.createError("not-found", `Not Found: didn't find any "${this.pluralName}" which had "${prop}" set to "${value}"; note the path in the database which was searched was "${this.dbPath}".`);
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
                throw commonTypes.createError("model/findAll", `\nFailed getting via getList() with query` + JSON.stringify(query, null, 2), e);
            }
            return new List$$1(this, results);
        }
        /** sets a record to the database */
        async set(record, auditInfo = {}) {
            if (!record.id) {
                throw commonTypes.createError("set/no-id", `Attempt to set "${this.dbPath}" in database but record had no "id" property.`);
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
            const id = firebaseKey.key();
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
            const path = `${Model$$1.auditBase}/${this.pluralName}`;
            let query = serializedQuery.SerializedQuery.path(path);
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
            const path = slashNotation(Model$$1.auditBase, this.pluralName);
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
            let query = serializedQuery.SerializedQuery.path(this.dbPath).orderByChild(child);
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
    Model$$1.defaultDb = null;
    /** The base path in the database to store audit logs */
    Model$$1.auditBase = "logging/audit_logs";

    class Record {
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
            const model = Model$$1.create(schema, options);
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
                throw commonTypes.createError("record/invalid-path", `Invalid Record Path: you can not ask for the dbPath before setting an "id" property.`);
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
                throw commonTypes.createError("UpdateProps", `An error occurred trying to update ${this._model.modelName}:${this.id}`, e);
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
            this.id = firebaseKey.key();
            if (!this.db) {
                const e = new Error(`Attempt to save Record failed as the Database has not been connected yet. Try setting Model.defaultDb first.`);
                e.name = "FiremodelError";
                throw e;
            }
            await this.db.set(this.dbPath, this.data);
            return this;
        }
    }

    const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
    class List$$1 {
        constructor(_model, _data = []) {
            this._model = _model;
            this._data = _data;
        }
        static create(schema$$1, options = {}) {
            const model = Model$$1.create(schema$$1, options);
            return new List$$1(model);
        }
        /**
         * Creates a List<T> which is populated with the passed in query
         *
         * @param schema the schema type
         * @param query the serialized query; note that this LIST will override the path of the query
         * @param options model options
         */
        static async fromQuery(schema$$1, query, options = {}) {
            const model = Model$$1.create(schema$$1, options);
            query.setPath(model.dbPath);
            const list = List$$1.create(schema$$1, options);
            await list.load(query);
            return list;
        }
        /**
         * Loads all the records of a given schema-type ordered by lastUpdated
         *
         * @param schema the schema type
         * @param options model options
         */
        static async all(schema$$1, options = {}) {
            const query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated");
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        /**
         * Loads the first X records of the Schema type where
         * ordering is provided by the "createdAt" property
         *
         * @param schema the schema type
         * @param howMany the number of records to bring back
         * @param options model options
         */
        static async first(schema$$1, howMany, options = {}) {
            const query = new serializedQuery.SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        /**
         * recent
         *
         * Get recent items of a given type/schema (based on lastUpdated)
         *
         * @param schema the TYPE you are interested
         * @param howMany the quantity to of records to bring back
         * @param offset start at an offset position (useful for paging)
         * @param options
         */
        static async recent(schema$$1, howMany, offset = 0, options = {}) {
            const query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
            const list = await List$$1.fromQuery(schema$$1, query, options);
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
        static async since(schema$$1, since, options = {}) {
            if (typeof since !== "number") {
                const e = new Error(`Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`);
                e.name = "NotAllowed";
                throw e;
            }
            // const query = new SerializedQuery().orderByChild("lastUpdated").startAt(since);
            const query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").startAt(since);
            console.log("QUERY", query);
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        static async inactive(schema$$1, howMany, options = {}) {
            const query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        static async last(schema$$1, howMany, options = {}) {
            const query = new serializedQuery.SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        static async where(schema$$1, property$$1, value, options = {}) {
            let operation = "=";
            let val = value;
            if (Array.isArray(value)) {
                val = value[1];
                operation = value[0];
            }
            const query = new serializedQuery.SerializedQuery().orderByChild(property$$1).where(operation, val);
            const list = await List$$1.fromQuery(schema$$1, query, options);
            return list;
        }
        get length() {
            return this._data.length;
        }
        get db() {
            return this._model.db;
        }
        get modelName() {
            return this._model.modelName;
        }
        get pluralName() {
            return this._model.pluralName;
        }
        get dbPath() {
            return [this.meta.dbOffset, this.pluralName].join("/");
        }
        get localPath() {
            return [this.meta.localOffset, this.pluralName].join("/");
        }
        get meta() {
            return this._model.schema.META;
        }
        /** Returns another List with data filtered down by passed in filter function */
        filter(f) {
            return new List$$1(this._model, this._data.filter(f));
        }
        /** Returns another List with data filtered down by passed in filter function */
        find(f, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
            const filtered = this._data.filter(f);
            const r = Record.create(this._model.schemaClass);
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
            return new List$$1(this._model, this._data.filter(whereFilter));
        }
        /**
         * findWhere
         *
         * returns the first record in the list where the property equals the
         * specified value. If no value is found then an error is thrown unless
         * it is stated
         */
        findWhere(prop, value, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
            console.log(this._data);
            const list = this.filterWhere(prop, value);
            if (list.length > 0) {
                return Record.load(this._model.schemaClass, list._data[0]);
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
         * Returns the specified record Record object
         *
         * @param id the unique ID which is being looked for
         * @param defaultIfNotFound the default value returned if the ID is not found in the list
         */
        get(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
            const find = this.filter(f => f.id === id);
            if (find.length === 0) {
                if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
                    return defaultIfNotFound;
                }
                const e = new Error(`Could not find "${id}" in list of ${this._model.pluralName}`);
                e.name = "NotFound";
                throw e;
            }
            const r = new Record(this._model);
            r._initialize(find.data[0]);
            return r;
        }
        /**
         * Returns the single instance of an object contained by the List container
         *
         * @param id the unique ID which is being looked for
         * @param defaultIfNotFound the default value returned if the ID is not found in the list
         */
        getData(id, defaultIfNotFound = "__DO_NOT_USE__") {
            const record = this.get(id, defaultIfNotFound);
            return record === defaultIfNotFound ? defaultIfNotFound : record.data;
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

    exports.fbKey = firebaseKey.key;
    exports.property = property;
    exports.pushKey = pushKey;
    exports.constrainedProperty = constrainedProperty;
    exports.constrain = constrain;
    exports.min = min;
    exports.max = max;
    exports.length = length;
    exports.desc = desc;
    exports.hasMany = hasMany;
    exports.ownedBy = ownedBy;
    exports.inverse = inverse;
    exports.schema = schema;
    exports.BaseSchema = BaseSchema;
    exports.Model = Model$$1;
    exports.Record = Record;
    exports.List = List$$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=firemodel.umd.js.map
