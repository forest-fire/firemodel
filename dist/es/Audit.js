"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const private_1 = require("@/private");
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
async function writeAudit(record, action, changes, options = {}) {
    const db = options.db || private_1.FireModel.defaultDb;
    await private_1.Record.add(private_1.AuditLog, {
        modelName: private_1.capitalize(record.modelName),
        modelId: record.id,
        action,
        changes,
    }, { db });
}
exports.writeAudit = writeAudit;
//# sourceMappingURL=Audit.js.map