import { Table } from "dexie";
import { IDexieModelMeta, IModelConstructor, IPrimaryKey, Model } from "../private";
/**
 * Provides a simple API to do CRUD operations
 * on Dexie/IndexDB which resembles the Firemodel
 * API.
 */
export declare class DexieRecord<T extends Model> {
    private modelConstructor;
    private table;
    private meta;
    constructor(modelConstructor: IModelConstructor<T>, table: Table<any, any>, meta: IDexieModelMeta);
    /**
     * Gets a specific record from the **IndexDB**; if record is not found the
     * `dexie/record-not-found` error is thrown.
     *
     * @param pk the primary key for the record; which is just the `id` in many cases
     * but becomes a `CompositeKey` if the model has a dynamic path.
     */
    get(pk: IPrimaryKey<T>): Promise<T>;
    /**
     * Adds a new record of _model_ `T`; if an `id` is provided it is used otherwise
     * it will generate an id using the client-side library 'firebase-key'.
     *
     * @param record the dictionary representing the new record
     */
    add(record: Partial<T>): Promise<T>;
    /**
     * Update an existing record in the **IndexDB**
     */
    update(pk: IPrimaryKey<T>, updateHash: Partial<T>): Promise<void>;
    remove(id: IPrimaryKey<T>): Promise<void>;
}
