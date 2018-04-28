var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createError } from "common-types";
import Model from "./model";
import { key as fbk } from "firebase-key";
export class Record {
    constructor(_model, data = {}) {
        this._model = _model;
        this._existsOnDB = false;
        this._writeOperations = [];
        this._data = new _model.schemaClass();
        if (data) {
            this.initialize(data);
        }
    }
    static create(schema, options = {}) {
        const model = Model.create(schema, options);
        const record = new Record(model, options);
        return record;
    }
    static get(schema, id, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = Record.create(schema, options);
            yield record.load(id);
            return record;
        });
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
    get dbPath() {
        if (!this.data.id) {
            throw createError("record/invalid-path", `Invalid Record Path: you can not ask for the dbPath before setting an "id" property.`);
        }
        return [this.data.META.dbOffset, this.pluralName, this.data.id].join("/");
    }
    get modelName() {
        return this.data.constructor.name.toLowerCase();
    }
    get id() {
        return this.data.id;
    }
    get localPath() {
        if (!this.data.id) {
            throw new Error('Invalid Path: you can not ask for the dbPath before setting an "id" property.');
        }
        return [this.data.META.localOffset, this.pluralName, this.data.id].join("/");
    }
    initialize(data) {
        Object.keys(data).map((key) => {
            this._data[key] = data[key];
        });
    }
    get existsOnDB() {
        return this.data && this.data.id ? true : false;
    }
    load(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this._data.id = id;
            const data = yield this.db.getRecord(this.dbPath);
            if (data && data.id) {
                this.initialize(data);
            }
            else {
                throw new Error(`Unknown Key: the key "${id}" was not found in Firebase at "${this.dbPath}".`);
            }
            return this;
        });
    }
    update(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data.id || !this._existsOnDB) {
                throw new Error(`Invalid Operation: you can not update a record which doesn't have an "id" or which has never been saved to the database`);
            }
            return this.db.update(this.dbPath, hash);
        });
    }
    pushKey(property, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.META.pushKeys.indexOf(property) === -1) {
                throw createError("invalid-operation/not-pushkey", `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`);
            }
            if (!this.existsOnDB) {
                throw createError("invalid-operation/not-on-db", `Invalid Operation: you can not push to property "${property}" before saving the record to the database`);
            }
            const pushKey = fbk();
            const currentState = this.get(property) || {};
            const newState = Object.assign({}, currentState, { [pushKey]: value });
            this.set(property, newState);
            const write = this.db.multiPathSet();
            write.add({ path: `${this.dbPath}/lastUpdated`, value: Date.now() });
            write.add({ path: `${this.dbPath}/${property}/${pushKey}`, value });
            try {
                yield write.execute();
            }
            catch (e) {
                throw createError("multi-path/write-error", "", e);
            }
            return pushKey;
        });
    }
    set(prop, value) {
        this._data[prop] = value;
        return this;
    }
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
}
