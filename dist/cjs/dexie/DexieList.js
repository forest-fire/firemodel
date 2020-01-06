"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const util_1 = require("../util");
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
class DexieList {
    constructor(modelConstructor, table, meta) {
        this.modelConstructor = modelConstructor;
        this.table = table;
        this.meta = meta;
    }
    async all(options = {
        orderBy: "lastUpdated"
    }) {
        const c = this.table.orderBy(options.orderBy);
        if (options.limit) {
            c.limit(options.limit);
        }
        if (options.offset) {
            c.offset(options.offset);
        }
        return c.toArray().catch(e => {
            throw new errors_1.DexieError(`Problem with list(${util_1.capitalize(this.meta.modelName)}).all(${options}): ${e.message}`, `dexie/${e.code || e.name || "list.all"}`);
        });
    }
}
exports.DexieList = DexieList;
//# sourceMappingURL=DexieList.js.map