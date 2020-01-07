import { Model } from "../Model";
import { IModelConstructor } from "..";
import Dexie from "dexie";
import { IDexieModelMeta, IDexieListOptions } from "../@types/optional/dexie";
import { IComparisonOperator } from "serialized-query";
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export declare class DexieList<T extends Model, K extends keyof T> {
    private modelConstructor;
    private table;
    private meta;
    constructor(modelConstructor: IModelConstructor<T>, table: Dexie.Table<T, any>, meta: IDexieModelMeta);
    all(options?: IDexieListOptions<T>): Promise<T[]>;
    where(prop: keyof T & string, value: T[K] | [IComparisonOperator, T[K]], options?: IDexieListOptions<T>): Promise<T[]>;
}
