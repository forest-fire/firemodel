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
    /**
     * Get a full list of _all_ records of a given model type
     */
    async all(options = {
        orderBy: "lastUpdated",
    }) {
        // TODO: had to remove the `orderBy` for models with a composite key; no idea why!
        const c = this.meta.hasDynamicPath
            ? this.table
            : this.table.orderBy(options.orderBy);
        if (options.limit) {
            c.limit(options.limit);
        }
        if (options.offset) {
            c.offset(options.offset);
        }
        const results = c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`Problem with list(${capitalize(this.meta.modelName)}).all(${JSON.stringify(options)}): ${e.message}`, `dexie/${e.code || e.name || "list.all"}`);
            }
        });
        return results || [];
    }
    /**
     * Limit the list of records based on the evaluation of a single
     * properties value. Default comparison is equality but you can
     * change the `value` to a Tuple and include the `<` or `>` operator
     * as the first param to get other comparison operators.
     */
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
        const results = query.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.where("${prop}", ${JSON.stringify(value)}, ${JSON.stringify(options)}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.where"}`);
            }
        });
        return results || [];
    }
    /**
     * Get the "_x_" most recent records of a given type (based on the
     * `lastUpdated` property).
     */
    async recent(limit, skip) {
        const c = skip
            ? this.table.orderBy("lastUpdated").reverse().limit(limit).offset(skip)
            : this.table.orderBy("lastUpdated").reverse().limit(limit);
        return c.toArray();
    }
    /**
     * Get all records updated since a given timestamp.
     */
    async since(datetime, options = {}) {
        return this.where("lastUpdated", [">", datetime]);
    }
    /**
     * Get the _last_ "x" records which were created.
     */
    async last(limit, skip) {
        const c = skip
            ? this.table.orderBy("createdAt").reverse().limit(limit).offset(skip)
            : this.table.orderBy("createdAt").reverse().limit(limit);
        return c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.last(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.last"}`);
            }
        });
    }
    /**
     * Get the _first_ "x" records which were created (aka, the earliest records created)
     */
    async first(limit, skip) {
        const c = skip
            ? this.table.orderBy("createdAt").limit(limit).offset(skip)
            : this.table.orderBy("createdAt").limit(limit);
        return c.toArray().catch((e) => {
            if (e.code === "NotFoundError" || e.name === "NotFoundError") {
                console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
                return [];
            }
            else {
                throw new DexieError(`list.first(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.first"}`);
            }
        });
    }
}
//# sourceMappingURL=DexieList.js.map