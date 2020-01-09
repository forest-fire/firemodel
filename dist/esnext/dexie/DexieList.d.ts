import { Model } from "../Model";
import { IModelConstructor } from "..";
import Dexie from "dexie";
import { IDexieModelMeta, IDexieListOptions } from "../@types/optional/dexie";
import { IComparisonOperator } from "serialized-query";
import { epoch } from "common-types";
import { PropType } from "../@types/index";
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export declare class DexieList<T extends Model> {
    private modelConstructor;
    private table;
    private meta;
    constructor(modelConstructor: IModelConstructor<T>, table: Dexie.Table<T, any>, meta: IDexieModelMeta);
    all(options?: IDexieListOptions<T>): Promise<T[]>;
    where<K extends keyof T>(prop: K & string, value: PropType<T, K> | [IComparisonOperator, PropType<T, K>], options?: IDexieListOptions<T>): Promise<T[]>;
    /**
     * Get the "_x_" most recent records of a given type (based on the
     * `lastUpdated` property).
     */
    recent(limit: number, skip?: number): Promise<void>;
    /**
     * Get all records updated since a given timestamp.
     */
    since(datetime: epoch, options?: IDexieListOptions<T>): Promise<T[]>;
    /**
     * Get the _last_ "x" records which were created.
     */
    last(limit: number, skip?: number): Promise<void>;
    /**
     * Get the _first_ "x" records which were created (aka, the earliest records created)
     */
    first(limit: number, skip?: number): Promise<void>;
}
