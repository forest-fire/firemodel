var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createError } from "common-types";
import { VerboseError } from "./VerboseError";
import { Record, List } from "./index";
import * as pluralize from "pluralize";
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
export default class Model {
    constructor(_schemaClass, db, logger) {
        this._schemaClass = _schemaClass;
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
    get schemaClass() {
        return this._schemaClass;
    }
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
    newRecord(hash) {
        return hash ? new Record(this, hash) : new Record(this);
    }
    getRecord(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = new Record(this);
            return record.load(id);
        });
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = new List(this);
            return query ? list.load(query) : list.load(this.dbPath);
        });
    }
    findRecord(prop, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this._findBuilder(prop, value, true);
            const results = yield this.db.getList(query);
            if (results.length > 0) {
                const record = this.newRecord(results.pop());
                return record;
            }
            else {
                throw createError("not-found", `Not Found: didn't find any "${this.pluralName}" which had "${prop}" set to "${value}"; note the path in the database which was searched was "${this.dbPath}".`);
            }
        });
    }
    findAll(prop, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this._findBuilder(prop, value);
            let results;
            try {
                results = yield this.db.getList(query);
            }
            catch (e) {
                console.log("Error attempting to findAll() in Model.", e);
                throw createError("model/findAll", `\nFailed getting via getList() with query` + JSON.stringify(query, null, 2), e);
            }
            return new List(this, results);
        });
    }
    set(record, auditInfo = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!record.id) {
                throw createError("set/no-id", `Attempt to set "${this.dbPath}" in database but record had no "id" property.`);
            }
            const now = this.now();
            record = Object.assign({}, record, { lastUpdated: now });
            auditInfo = Object.assign({}, auditInfo, { properties: Object.keys(record) });
            const ref = yield this.crud("set", now, slashNotation(this.dbPath, record.id), record, auditInfo);
            return ref;
        });
    }
    push(newRecord, auditInfo = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = this.now();
            newRecord = Object.assign({}, newRecord, { lastUpdated: now, createdAt: now });
            auditInfo = Object.assign({}, auditInfo, { properties: Object.keys(newRecord) });
            const ref = yield this.crud("push", now, slashNotation(this.dbPath, fbk()), newRecord, auditInfo);
            return ref;
        });
    }
    update(key, updates, auditInfo = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = this.now();
            auditInfo = Object.assign({ auditInfo }, { updatedProperties: Object.keys(updates) });
            updates = Object.assign({}, updates, { lastUpdated: now });
            yield this.crud("update", now, slashNotation(this.dbPath, key), updates, auditInfo);
        });
    }
    multiPathUpdate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = this.now();
            const updates = {};
            payload.map(record => {
                record.lastUpdated = now;
                const basePath = slashNotation(this.dbPath, record.id);
                Object.keys(record)
                    .filter(p => p !== "id")
                    .map((prop) => {
                    updates[slashNotation(basePath, prop)] = record[prop];
                });
            });
            yield this.db.ref("/").update(updates);
            return;
        });
    }
    remove(key, returnValue = false, auditInfo = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = this.now();
            let value;
            if (returnValue) {
                value = yield this._db.getValue(key);
            }
            yield this.crud("remove", now, key.match(this.dbPath) ? key : slashNotation(this.dbPath, key), null, auditInfo);
            return returnValue ? value : undefined;
        });
    }
    getAuditTrail(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    audit(crud, when, key, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = slashNotation(Model.auditBase, this.pluralName);
            return this.db.push(path, {
                crud,
                when,
                key,
                info
            });
        });
    }
    crud(op, when, key, value, auditInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const isAuditable = this._schema.META.audit;
            const auditPath = slashNotation(Model.auditBase, this.pluralName, key);
            let auditRef;
            if (isAuditable) {
                auditRef = yield this.audit(op, when, key, auditInfo);
            }
            switch (op) {
                case "set":
                    return this.db.set(key, value);
                case "update":
                    return this.db.update(key, value);
                case "push":
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
        });
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
    generate(quantity, override = {}) {
        this.db.mock.queueSchema(this.modelName, quantity, override);
        this.db.mock.generate();
    }
    now() {
        return Date.now();
    }
}
Model.defaultDb = null;
Model.auditBase = "logging/audit_logs";
