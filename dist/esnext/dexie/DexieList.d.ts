import Dexie from "dexie";
import { IDexieListOptions, IDexieModelMeta } from "../@types/optional/dexie";
import { IComparisonOperator } from "universal-fire";
import { IModelConstructor } from "..";
import { Model } from "../models/Model";
import { PropType } from "../@types/index";
import { epoch } from "common-types";
/**
 * Provides a simple API for list based queries that resembles the Firemodel `List` API
 * but which works on the IndexDB using Dexie under the hood.
 */
export declare class DexieList<T extends Model> {
    private modelConstructor;
    private table;
    private meta;
    constructor(modelConstructor: IModelConstructor<T>, table: Dexie.Table<T, any>, meta: IDexieModelMeta);
    /**
     * Get a full list of _all_ records of a given model type
     */
    all(options?: IDexieListOptions<T>): Promise<T[]>;
    /**
     * Limit the list of records based on the evaluation of a single
     * properties value. Default comparison is equality but you can
     * change the `value` to a Tuple and include the `<` or `>` operator
     * as the first param to get other comparison operators.
     */
    where<K extends keyof T>(prop: K & string, value: PropType<T, K> | [IComparisonOperator, PropType<T, K>], options?: IDexieListOptions<T>): Promise<T[]>;
    /**
     * Get the "_x_" most recent records of a given type (based on the
     * `lastUpdated` property).
     */
    recent(limit: number, skip?: number): Promise<T[]>;
    /**
     * Get all records updated since a given timestamp.
     */
    since(datetime: epoch, options?: IDexieListOptions<T>): Promise<T[]>;
    /**
     * Get the _last_ "x" records which were created.
     */
    last(limit: number, skip?: number): Promise<T[]>;
    /**
     * Get the _first_ "x" records which were created (aka, the earliest records created)
     */
    first(limit: number, skip?: number): Promise<T[]>;
}
