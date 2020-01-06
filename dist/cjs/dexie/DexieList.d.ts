import { Model } from "../Model";
import { IModelConstructor } from "..";
import Dexie from "dexie";
import { IDexieModelMeta } from "../@types/optional/dexie";
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export declare class DexieList<T extends Model> {
    private modelConstructor;
    private table;
    private meta;
    constructor(modelConstructor: IModelConstructor<T>, table: Dexie.Table<T, any>, meta: IDexieModelMeta);
    all(options?: {
        orderBy?: keyof T & string;
        limit?: number;
        offset?: number;
    }): Promise<T[]>;
}
