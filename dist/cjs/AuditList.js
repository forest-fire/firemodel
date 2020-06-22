"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditList = void 0;
const AuditBase_1 = require("./AuditBase");
const universal_fire_1 = require("universal-fire");
const path_1 = require("./path");
class AuditList extends AuditBase_1.AuditBase {
    constructor(modelKlass, options = {}) {
        super(modelKlass, options);
        this._query = universal_fire_1.SerializedQuery.create(this.db, path_1.pathJoin(this.dbPath, "all"));
    }
    async first(howMany, offset = 0) {
        this._query = this._query.limitToFirst(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async last(howMany, offset = 0) {
        this._query = this._query.limitToLast(howMany).startAt(offset);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async since(when) {
        this._query = this._query.orderByChild("createdAt").startAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async before(when) {
        this._query = this._query.orderByChild("createdAt").endAt(when);
        const log = await this.db.getList(this._query);
        return log || [];
    }
    async between(from, to) {
        this._query = this._query.orderByChild("createdAt").startAt(from).endAt(to);
        const log = await this.db.getList(this._query);
        return log || [];
    }
}
exports.AuditList = AuditList;
//# sourceMappingURL=AuditList.js.map