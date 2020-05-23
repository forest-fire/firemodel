"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    BaseSerializer;
}
from;
"@forest-fire/serialized-query";
const private_1 = require("@/private");
class AuditBase {
    constructor(modelKlass, options = {}) {
        this._modelKlass = modelKlass;
        this._record = private_1.Record.create(modelKlass);
        this._db = options.db || private_1.FireModel.defaultDb;
    }
    get db() {
        return this._db;
    }
    get dbPath() {
        return private_1.pathJoin(private_1.FireModel.auditLogs, this._record.pluralName);
    }
}
exports.AuditBase = AuditBase;
//# sourceMappingURL=AuditBase.js.map