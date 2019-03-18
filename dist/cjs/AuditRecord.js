"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuditBase_1 = require("./AuditBase");
const serialized_query_1 = require("serialized-query");
const path_1 = require("./path");
const wait_in_parallel_1 = require("wait-in-parallel");
class AuditRecord extends AuditBase_1.AuditBase {
    constructor(modelKlass, id, options = {}) {
        super(modelKlass, options);
        this._recordId = id;
        this._query = new serialized_query_1.SerializedQuery();
    }
    async first(howMany, startAt) {
        this._query = this._query.setPath(this.byId);
        this._query = this._query.orderByKey().limitToLast(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        const ids = (await this.db.getList(this._query)).map(i => path_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map(id => p.add(id, this.db.getValue(id)));
        const results = await p.isDoneAsArray();
        return results;
    }
    async last(howMany, startAt) {
        this._query = this._query
            .setPath(this.byId)
            .orderByKey()
            .limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        const ids = (await this.db.getList(this._query)).map(i => path_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map(id => p.add(id, this.db.getValue(id)));
        const results = await p.isDoneAsArray();
        return results;
    }
    async since(when) {
        if (typeof when === "string") {
            when = new Date(when).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .startAt(when);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map(i => path_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map(id => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    async before(when) {
        if (typeof when === "string") {
            when = new Date(when).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .endAt(when);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map(i => path_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map(id => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    async between(after, before) {
        if (typeof after === "string") {
            after = new Date(after).getTime();
        }
        if (typeof before === "string") {
            before = new Date(before).getTime();
        }
        this._query = this._query
            .setPath(this.byId)
            .orderByChild("value")
            .startAt(after)
            .endAt(before);
        const qr = await this.db.getList(this._query);
        const ids = (await this.db.getList(this._query)).map(i => path_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map(id => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    get auditLogs() {
        return path_1.pathJoin(this.dbPath, "all");
    }
    get byId() {
        return path_1.pathJoin(this.dbPath, "byId", this._recordId, "all");
    }
    byProp(prop) {
        return path_1.pathJoin(this.dbPath, "byId", this._recordId, "props", prop);
    }
}
exports.AuditRecord = AuditRecord;
//# sourceMappingURL=AuditRecord.js.map