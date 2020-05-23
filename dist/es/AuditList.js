"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_serializer_1 = require("@forest-fire/base-serializer");
const private_1 = require("@/private");
class AuditList extends private_1.AuditBase {
    constructor(modelKlass, options = {}) {
        super(modelKlass, options);
        this._query = base_serializer_1.SerializedQuery.create(this.db, private_1.pathJoin(this.dbPath, "all"));
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