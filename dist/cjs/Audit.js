"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAudit = void 0;
const FireModel_1 = require("./FireModel");
const index_1 = require("./index");
const Record_1 = require("./Record");
const util_1 = require("./util");
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
    const db = options.db || FireModel_1.FireModel.defaultDb;
    await Record_1.Record.add(index_1.AuditLog, {
        modelName: util_1.capitalize(record.modelName),
        modelId: record.id,
        action,
        changes
    }, { db });
}
exports.writeAudit = writeAudit;
//# sourceMappingURL=Audit.js.map