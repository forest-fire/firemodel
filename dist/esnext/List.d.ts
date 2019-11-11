import { Model } from "./Model";
import { Record } from "./Record";
import { SerializedQuery, IComparisonOperator } from "serialized-query";
import { epochWithMilliseconds, IDictionary } from "common-types";
import { FireModel } from "./FireModel";
import { RealTimeDB } from "abstracted-firebase";
import { IReduxDispatch } from "./state-mgmt/index";
import { IListOptions } from "./@types/general";
import { IPrimaryKey } from "./@types";
export declare class List<T extends Model> extends FireModel<T> {
    /**
     * Sets the default database to be used by all FireModel classes
     * unless explicitly told otherwise
     */
    static set defaultDb(db: RealTimeDB);
    static get defaultDb(): RealTimeDB;
    /**
     * Set
     *
     * Sets a given model to the payload passed in. This is
     * a destructive operation ... any other records of the
     * same type that existed beforehand are removed.
     */
    static set<T extends Model>(model: new () => T, payload: IDictionary<T>): Promise<List<T>>;
    static set dispatch(fn: IReduxDispatch);
    static create<T extends Model>(model: new () => T, options?: IListOptions<T>): List<T>;
    /**
     * Creates a List<T> which is populated with the passed in query
     *
     * @param schema the schema type
     * @param query the serialized query; note that this LIST will override the path of the query
     * @param options model options
     */
    static fromQuery<T extends Model>(model: new () => T, query: SerializedQuery<T>, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */
    static all<T extends Model>(model: new () => T, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * Loads the first X records of the Schema type where
     * ordering is provided by the "createdAt" property
     *
     * @param model the model type
     * @param howMany the number of records to bring back
     * @param options model options
     */
    static first<T extends Model>(model: new () => T, howMany: number, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * recent
     *
     * Get recent items of a given type/schema (based on lastUpdated)
     *
     * @param model the TYPE you are interested
     * @param howMany the quantity to of records to bring back
     * @param offset start at an offset position (useful for paging)
     * @param options
     */
    static recent<T extends Model>(model: new () => T, howMany: number, offset?: number, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * **since**
     *
     * Brings back all records that have changed since a given date (using `lastUpdated` field)
     */
    static since<T extends Model>(model: new () => T, since: epochWithMilliseconds, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * **List.inactive()**
     *
     * provides a way to sort out the "x" _least active_ records where
     * "least active" means that their `lastUpdated` property has gone
     * without any update for the longest.
     */
    static inactive<T extends Model>(model: new () => T, howMany: number, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * **List.last()**
     *
     * Lists the _last "x"_ items of a given model where "last" refers to the datetime
     * that the record was **created**.
     */
    static last<T extends Model>(model: new () => T, howMany: number, options?: IListOptions<T>): Promise<List<T>>;
    /**
     * **List.find()**
     *
     * Runs a `List.where()` search and returns the first result as a _model_
     * of type `T`. If no results were found it returns `undefined`.
     */
    static find<T extends Model, K extends keyof T>(model: new () => T, property: K, value: T[K] | [IComparisonOperator, T[K]], options?: IListOptions<T>): Promise<T>;
    /**
     * **List.where()**
     *
     * A static inializer which give you a list of all records of a given model
     * which meet a given logical condition. This condition is executed on the
     * **Firebase** side and a `List` -- even if no results met the criteria --
     * is returned.
     *
     * **Note:** the default comparison operator is **equals** but you can
     * override this default by adding a _tuple_ to the `value` where the first
     * array item is the operator, the second the value you are comparing against.
     */
    static where<T extends Model, K extends keyof T>(model: new () => T, property: K, value: T[K] | [IComparisonOperator, T[K]], options?: IListOptions<T>): Promise<List<T>>;
    /**
     * Get's a _list_ of records. The return object is a `List` but the way it is composed
     * doesn't actually do a query against the database but instead it just takes the array of
     * `id`'s passed in,
     *
     * **Note:** the term `ids` is not entirely accurate, it should probably be phrased as `fks`
     * because the "id" can be any form of `ICompositeKey` as well just a plain `id`. The naming
     * here is just to retain consistency with the **Watch** api.
     */
    static ids<T extends Model>(model: new () => T, ...fks: Array<IPrimaryKey<T>>): Promise<List<T>>;
    /**
     * If you want to just get the `dbPath` of a Model you can call
     * this static method and the path will be returned.
     *
     * **Note:** the optional second parameter lets you pass in any
     * dynamic path segments if that is needed for the given model.
     */
    static dbPath<T extends Model, K extends keyof T>(model: new () => T, offsets?: Partial<T>): string;
    protected _offsets: Partial<T>;
    private _data;
    constructor(model: new () => T, options?: IListOptions<T>);
    get length(): number;
    get dbPath(): string;
    /**
     * Gives the path in the client state tree to the beginning
     * where this LIST will reside.
     *
     * Includes `localPrefix` and `pluralName`, but does not include `localPostfix`
     */
    get localPath(): any;
    /**
     * Used with local state management tools, it provides a postfix to the state tree path
     * The default is `all` and it will probably be used in most cases
     *
     * e.g. If the model is called `Tree` then your records will be stored at `trees/all`
     * (assuming the default `all` postfix)
     */
    get localPostfix(): string;
    /** Returns another List with data filtered down by passed in filter function */
    filter(f: ListFilterFunction<T>): List<T>;
    /** Returns another List with data filtered down by passed in filter function */
    find(f: ListFilterFunction<T>, defaultIfNotFound?: string): Record<T>;
    filterWhere<K extends keyof T>(prop: K, value: T[K]): List<T>;
    filterContains<K extends keyof T>(prop: K, value: any): List<T>;
    /**
     * findWhere
     *
     * returns the first record in the list where the property equals the
     * specified value. If no value is found then an error is thrown unless
     * it is stated
     */
    findWhere(prop: keyof T & string, value: T[typeof prop], defaultIfNotFound?: string): Record<T>;
    /**
     * provides a `map` function over the records managed by the List; there
     * will be no mutations to the data managed by the list
     */
    map<K = any>(f: ListMapFunction<T, K>): K[];
    /**
     * provides a `forEach` function to iterate over the records managed by the List
     */
    forEach<K = any>(f: ListMapFunction<T, K>): void;
    /**
     * runs a `reducer` function across all records in the list
     */
    reduce<K = any>(f: ListReduceFunction<T, K>, initialValue?: {}): {};
    /**
     * Gives access to the List's array of records
     */
    get data(): T[];
    /**
     * Returns the Record object with the given ID, errors if not found (name: NotFound)
     * unless call signature includes "defaultIfNotFound"
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    findById(id: string, defaultIfNotFound?: any): Record<T>;
    removeById(id: string, ignoreOnNotFound?: boolean): Promise<void>;
    add(payload: T): Promise<Record<T>>;
    /**
     * Returns the single instance of an object contained by the List container
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    getData(id: string, defaultIfNotFound?: any): T;
    load(pathOrQuery: string | SerializedQuery<T>): Promise<this>;
    private _injectDynamicDbOffsets;
}
export declare type ListFilterFunction<T> = (fc: T) => boolean;
export declare type ListMapFunction<T, K = any> = (fc: T) => K;
export declare type ListReduceFunction<T, K = any> = (accumulator: Partial<K>, record: T) => K;
