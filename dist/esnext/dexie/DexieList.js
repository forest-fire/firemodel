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
}
//# sourceMappingURL=DexieList.js.map