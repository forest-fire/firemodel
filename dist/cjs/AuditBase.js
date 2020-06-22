"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditBase = void 0;
const FireModel_1 = require("./FireModel");
const Record_1 = require("./Record");
const path_1 = require("./path");
class AuditBase {
    constructor(modelKlass, options = {}) {
        this._modelKlass = modelKlass;
        this._record = Record_1.Record.create(modelKlass);
        this._db = options.db || FireModel_1.FireModel.defaultDb;
    }
    get db() {
        return this._db;
    }
    get dbPath() {
        return path_1.pathJoin(FireModel_1.FireModel.auditLogs, this._record.pluralName);
    }
}
exports.AuditBase = AuditBase;
//# sourceMappingURL=AuditBase.js.map