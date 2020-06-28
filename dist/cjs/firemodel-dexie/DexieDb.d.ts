import Dexie, { TableSchema } from "dexie";
import { DexieList, DexieRecord } from "./index";
import { IDexiePriorVersion, IModel, IModelConstructor, IPrimaryKey } from "../types";
import { IDictionary } from "common-types";
/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
export declare class DexieDb {
    private _name;
    /**
     * Takes a _deconstructed_ array of **Firemodel** `Model` constructors and converts
     * them into a dictionary of Dexie-compatible model definitions where the _key_ to
     * the dictionary is the plural name of the model
     */
    static modelConversion<T extends IModel>(...modelConstructors: Array<IModelConstructor<T>>): IDictionary<string>;
    /**
     * For _testing_ (or other edge cases where there is no global IDB) you may
     * pass in your own IndexDB API.
     *
     * This allows leveraging libraries such as:
     * - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)
     */
    static indexedDB(indexedDB: any, idbKeyRange?: any): void;
    /** if set, this library will be used instead of the globally scoped library */
    private static _indexedDb;
    /**
     * read access to the **Dexie** model definitions
     */
    get models(): IDictionary<string>;
    /**
     * read access to the **IndexDB**'s _name_
     */
    get dbName(): Readonly<string>;
    get version(): number;
    /**
     * The models which are known to this `DexieModel` instance.
     * The names will be in the _singular_ vernacular.
     */
    get modelNames(): string[];
    /**
     * The models which are known to this `DexieModel` instance.
     * The names will be in the _plural_ vernacular.
     */
    get pluralNames(): string[];
    get db(): Readonly<Dexie>;
    get status(): string;
    get isMapped(): boolean;
    /**
     * The tables (and schemas) which Dexie is currently managing
     * in IndexedDB.
     *
     * Note: this will throw a "not-ready" error
     * if Dexie has _not_ yet connected to the DB.
     */
    get dexieTables(): {
        name: string;
        schema: TableSchema;
    }[];
    /** simple dictionary of Dixie model defn's for indexation */
    private _models;
    private _constructors;
    /** the core **Dexie** API surface */
    private _db;
    /** META information for each of the `Model`'s */
    private _meta;
    /** maps `Model`'s singular name to a plural */
    private _singularToPlural;
    /** the current version number for the indexDB database */
    private _currentVersion;
    private _priors;
    /** flag to indicate whether the Dexie DB has begun the initialization */
    private _isMapped;
    private _status;
    constructor(_name: string, ...models: Array<IModelConstructor<any>>);
    /**
     * Allows the addition of prior versions of the database. This sits on top
     * of the Dexie abstraction so you get all the nice benefits of that API.
     *
     * Structurally this function conforms to the _fluent_ API style and returns
     * the `DexieDb` instance.
     *
     * Find out more from:
     * - [Dexie Docs](https://dexie.org/docs/Tutorial/Design#database-versioning)
     * - [Prior Version _typing_](https://github.com/forest-fire/firemodel/blob/master/src/%40types/dexie.ts)
     */
    addPriorVersion(version: IDexiePriorVersion): this;
    /**
     * Checks whether Dexie/IndexedDB is managing the state for a given
     * `Model`
     *
     * @param model the `Model` in question
     */
    modelIsManagedByDexie<T extends IModel>(model: IModelConstructor<T>): boolean;
    /**
     * Returns a typed **Dexie** `Table` object for a given model class
     */
    table<T extends IModel>(model: IModelConstructor<T>): Dexie.Table<T, IPrimaryKey<T>>;
    /**
     * Provides a **Firemodel**-_like_ API surface to interact with singular
     * records.
     *
     * @param model the **Firemodel** model (aka, the constructor)
     */
    record<T extends IModel>(model: IModelConstructor<T>): DexieRecord<T>;
    /**
     * Provides a very **Firemodel**-_like_ API surface to interact with LIST based
     * queries.
     *
     * @param model the **Firemodel** `Model` name
     */
    list<T extends IModel>(model: IModelConstructor<T>): DexieList<T>;
    /**
     * Returns the META for a given `Model` identified by
     * the model's _plural_ (checked first) or _singular_ name.
     */
    meta(name: string, _originated?: string): any;
    /**
     * Returns a constructor for a given **Firemodel** `Model`
     *
     * @param name either the _plural_ or _singular_ name of a model
     * managed by the `DexieModel` instance
     */
    modelConstructor(name: string): IModelConstructor<any>;
    /**
     * Checks whether the connection to the **IndexDB** is open
     */
    isOpen(): boolean;
    /**
     * Sets all the defined models (as well as priors) to the
     * Dexie DB instance.
     */
    mapModels(): void;
    /**
     * Opens the connection to the **IndexDB**.
     *
     * Note: _if the **Firemodel** models haven't yet been mapped to Dexie
     * then they will be prior to openning the connection._
     */
    open(): Promise<Dexie>;
    /**
     * Closes the IndexDB connection
     */
    close(): void;
    private _checkPluralThenSingular;
    private _mapVersionsToDexie;
}
