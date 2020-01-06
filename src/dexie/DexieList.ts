import { Model } from "../Model";
import { IModelConstructor } from "..";
import Dexie from "dexie";
import { IDexieModelMeta } from "../@types/optional/dexie";
import { DexieError } from "../errors";
import { capitalize } from "../util";

/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export class DexieList<T extends Model> {
  constructor(
    private modelConstructor: IModelConstructor<T>,
    private table: Dexie.Table<T, any>,
    private meta: IDexieModelMeta
  ) {}

  async all(
    options: { orderBy?: keyof T & string; limit?: number; offset?: number } = {
      orderBy: "lastUpdated"
    }
  ) {
    const c = this.table.orderBy(options.orderBy);
    if (options.limit) {
      c.limit(options.limit);
    }
    if (options.offset) {
      c.offset(options.offset);
    }

    return c.toArray().catch(e => {
      throw new DexieError(
        `Problem with list(${capitalize(
          this.meta.modelName
        )}).all(${options}): ${e.message}`,
        `dexie/${e.code || e.name || "list.all"}`
      );
    });
  }
}
