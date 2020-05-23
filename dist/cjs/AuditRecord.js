"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRecord = void 0;
const base_serializer_1 = require("@forest-fire/base-serializer");
const wait_in_parallel_1 = require("wait-in-parallel");
const private_1 = require("@/private");
class AuditRecord extends private_1.AuditBase {
    constructor(modelKlass, id, options = {}) {
        super(modelKlass, options);
        this._recordId = id;
        this._query = base_serializer_1.SerializedQuery.create(this.db);
    }
    /**
     * Queries the database for the first _x_ audit records [`howMany`] of
     * a given Record type. You can also optionally specify an offset to
     * start at [`startAt`].
     */
    async first(howMany, startAt) {
        this._query = this._query.setPath(this.byId);
        this._query = this._query.orderByKey().limitToLast(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        const ids = (await this.db.getList(this._query)).map((i) => private_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map((id) => p.add(id, this.db.getValue(id)));
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
        const ids = (await this.db.getList(this._query)).map((i) => private_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map((id) => p.add(id, this.db.getValue(id)));
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
        const ids = (await this.db.getList(this._query)).map((i) => private_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map((id) => {
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
        const ids = (await this.db.getList(this._query)).map((i) => private_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map((id) => {
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
        const ids = (await this.db.getList(this._query)).map((i) => private_1.pathJoin(this.auditLogs, i.id));
        const p = new wait_in_parallel_1.Parallel();
        ids.map((id) => {
            p.add(id, this.db.getValue(id));
        });
        const results = await p.isDoneAsArray();
        return results;
    }
    get auditLogs() {
        return private_1.pathJoin(this.dbPath, "all");
    }
    get byId() {
        return private_1.pathJoin(this.dbPath, "byId", this._recordId, "all");
    }
    byProp(prop) {
        return private_1.pathJoin(this.dbPath, "byId", this._recordId, "props", prop);
    }
}
exports.AuditRecord = AuditRecord;
//# sourceMappingURL=AuditRecord.js.map