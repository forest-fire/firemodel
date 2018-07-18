"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireModel_1 = require("./FireModel");
const path_1 = require("./path");
const AuditList_1 = require("./AuditList");
const wait_in_parallel_1 = require("wait-in-parallel");
const index_1 = require("./index");
const AuditRecord_1 = require("./AuditRecord");
/**
 * writeAudit
 *
 * Allows for a consistent way of writing audit records to the database
 *
 * @param recordId the ID of the record which is changing
 * @param pluralName the plural name of the Model type
 * @param action CRUD action
 * @param changes array of changes
 * @param options
 */
async function writeAudit(recordId, pluralName, action, changes, options = {}) {
    const db = options.db || FireModel_1.FireModel.defaultDb;
    const timestamp = new Date().getTime();
    const writePath = path_1.pathJoin(FireModel_1.FireModel.auditLogs, pluralName);
    const p = new wait_in_parallel_1.Parallel();
    const createdAt = new Date().getTime();
    const auditId = index_1.fbKey();
    p.add(`audit-log-${action}-on-${recordId}`, db.set(path_1.pathJoin(writePath, "all", auditId), {
        createdAt,
        recordId,
        timestamp,
        action,
        changes: changes.map(c => {
            c.before = c.before === undefined ? null : c.before;
            c.after = c.after === undefined ? null : c.after;
            return c;
        })
    }));
    const mps = db.multiPathSet(path_1.pathJoin(writePath, "byId", recordId));
    mps.add({ path: path_1.pathJoin("all", auditId), value: createdAt });
    changes.map(change => {
        mps.add({
            path: path_1.pathJoin("props", change.property, auditId),
            value: createdAt
        });
    });
    p.add("byId", mps.execute());
    await p.isDone();
}
exports.writeAudit = writeAudit;
class Audit {
    static list(modelKlass, options = {}) {
        return new AuditList_1.AuditList(modelKlass, options);
    }
    static record(modelKlass, id, options = {}) {
        return new AuditRecord_1.AuditRecord(modelKlass, id, options);
    }
}
exports.Audit = Audit;
//# sourceMappingURL=Audit.js.map