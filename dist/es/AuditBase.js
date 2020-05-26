import { FireModel, Record, pathJoin } from "@/private";
export class AuditBase {
    constructor(modelKlass, options = {}) {
        this._modelKlass = modelKlass;
        this._record = Record.create(modelKlass);
        this._db = options.db || FireModel.defaultDb;
    }
    get db() {
        return this._db;
    }
    get dbPath() {
        return pathJoin(FireModel.auditLogs, this._record.pluralName);
    }
}
//# sourceMappingURL=AuditBase.js.map