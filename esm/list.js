var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SerializedQuery } from "serialized-query";
import Model from "./model";
export class List {
    constructor(_model, _data = []) {
        this._model = _model;
        this._data = _data;
    }
    static create(schema, options = {}) {
        const model = Model.create(schema, options);
        return new List(model);
    }
    static from(schema, query, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = Model.create(schema, options);
            query.setPath(model.dbPath);
            const list = List.create(schema, options);
            yield list.load(query);
            return list;
        });
    }
    static first(schema, howMany, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
            const list = yield List.from(schema, query, options);
            return list;
        });
    }
    static recent(schema, howMany, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
            const list = yield List.from(schema, query, options);
            return list;
        });
    }
    static inactive(schema, howMany, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
            const list = yield List.from(schema, query, options);
            return list;
        });
    }
    static last(schema, howMany, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
            const list = yield List.from(schema, query, options);
            return list;
        });
    }
    static where(schema, property, value, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let operation = "=";
            let val = value;
            if (Array.isArray(value)) {
                val = value[1];
                operation = value[0];
            }
            const query = new SerializedQuery().orderByChild(property).where(operation, val);
            const list = yield List.from(schema, query, options);
            return list;
        });
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
    filter(f) {
        return new List(this._model, this._data.filter(f));
    }
    map(f) {
        return this._data.map(f);
    }
    get data() {
        return this._data;
    }
    load(pathOrQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            this._data = yield this.db.getList(pathOrQuery);
            return this;
        });
    }
}
