import { DexieError } from "../errors";
import { capitalize } from "../util";
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export class DexieList {
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
            throw new DexieError(`Problem with list(${capitalize(this.meta.modelName)}).all(${options}): ${e.message}`, `dexie/${e.code || e.name || "list.all"}`);
        });
    }
    async where(prop, value, options = {}) {
        // const c = this.table.orderBy(options.orderBy || "lastUpdated");
        const [op, val] = Array.isArray(value) && ["=", ">", "<"].includes(value[0])
            ? value
            : ["=", value];
        let query = op === "="
            ? this.table.where(prop).equals(val)
            : op === ">"
                ? this.table.where(prop).above(val)
                : this.table.where(prop).below(val);
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.offset(options.offset);
        }
        return query.toArray().catch(e => {
            throw new DexieError(`list.where(${prop}, ${value}, ${JSON.stringify(options)}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.where"}`);
        });
    }
}
//# sourceMappingURL=DexieList.js.map