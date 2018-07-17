import { FireModel } from "./FireModel";
import { pathJoin } from "./path";
import { AuditList } from "./AuditList";
import { Parallel } from "wait-in-parallel";
import { fbKey } from "./index";
import { AuditRecord } from "./AuditRecord";
export async function writeAudit(recordId, pluralName, action, changes, options = {}) {
    const db = options.db || FireModel.defaultDb;
    const timestamp = new Date().getTime();
    const writePath = pathJoin(FireModel.auditLogs, pluralName);
    const p = new Parallel();
    const createdAt = new Date().getTime();
    const auditId = fbKey();
    p.add(`audit-log-${action}-on-${recordId}`, db.set(pathJoin(writePath, "all", auditId), {
        createdAt,
        recordId,
        timestamp,
        action,
        changes
    }));
    const mps = db.multiPathSet(pathJoin(writePath, "byId", recordId));
    mps.add({ path: pathJoin("all", auditId), value: createdAt });
    changes.map(change => {
        mps.add({
            path: pathJoin("props", change.property, auditId),
            value: createdAt
        });
    });
    p.add("byId", mps.execute());
    await p.isDone();
}
export class Audit {
    static list(modelKlass, options = {}) {
        return new AuditList(modelKlass, options);
    }
    static record(modelKlass, id, options = {}) {
        return new AuditRecord(modelKlass, id, options);
    }
}
//# sourceMappingURL=Audit.js.map