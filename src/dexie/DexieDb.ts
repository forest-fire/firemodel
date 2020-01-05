import { IModelConstructor, Record, IFmModelMeta } from "..";
import { FireModelError, DexieError } from "../errors";
import { Model } from "../Model";
import { IDictionary } from "common-types";
import Dexie from "dexie";
import { IDexiePriorVersion, IDexieModelMeta } from "../@types/optional/dexie";
import { DexieRecord } from "./DexieRecord";

/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
export class DexieDb {
  //#region STATIC
  /**
   * Takes a _deconstructed_ array of **Firemodel** `Model` constructors and converts
   * them into a dictionary of Dexie-compatible model definitions where the _key_ to
   * the dictionary is the plural name of the model
   */
  public static modelConversion<T extends Model>(
    ...modelConstructors: Array<IModelConstructor<T>>
  ) {
    if (modelConstructors.length === 0) {
      throw new FireModelError(
        `A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`,
        "firemodel/no-models"
      );
    }

    return modelConstructors.reduce(
      (agg: IDictionary<string>, curr: IModelConstructor<T>) => {
        const dexieModel: string[] = [];
        const r = Record.createWith(curr, new curr());

        const compoundIndex = r.hasDynamicPath
          ? ["id"].concat(r.dynamicPathComponents)
          : "";

        if (compoundIndex) {
          dexieModel.push(`[${compoundIndex.join("+")}]`);
        }

        // UNIQUE Indexes
        (r.hasDynamicPath ? [] : ["id"])
          .concat(
            (r.META.dbIndexes || [])
              .filter(i => i.isUniqueIndex)
              .map(i => i.property)
          )
          .forEach(i => dexieModel.push(`&${i}`));

        // NON-UNIQUE Indexes
        const indexes = []
          .concat(
            (r.META.dbIndexes || [])
              .filter(i => i.isIndex && !i.isUniqueIndex)
              .map(i => i.property)
          )
          .forEach(i => dexieModel.push(i));

        // MULTI-LEVEL Indexes
        const multiEntryIndex = []
          .concat(
            r.META.dbIndexes
              .filter(i => i.isMultiEntryIndex)
              .map(i => i.property)
          )
          .forEach(i => dexieModel.push(`*${i}`));

        agg[r.pluralName] = dexieModel.join(",").trim();

        return agg;
      },
      {}
    );
  }

  /**
   * For _testing_ (or other edge cases where there is no global IDB) you may
   * pass in your own IndexDB API.
   *
   * This allows leveraging libraries such as:
   * - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)
   */
  public static indexedDB(indexedDB: any, idbKeyRange?: any) {
    // Dexie.dependencies.indexedDB = indexedDB;
    DexieDb._indexedDb = indexedDB;
    if (idbKeyRange) {
      Dexie.dependencies.IDBKeyRange = idbKeyRange;
    }
  }

  /** if set, this library will be used instead of the globally scoped library */
  private static _indexedDb: any;

  //#endregion STATIC

  /**
   * read access to the **Dexie** model definitions
   */
  public get models() {
    return this._models;
  }

  /**
   * read access to the **IndexDB**'s _name_
   */
  public get dbName(): Readonly<string> {
    return this._name;
  }

  public get version() {
    return this._currentVersion;
  }

  /**
   * The models which are known to this `DexieModel` instance.
   * The names will be in the _singular_ vernacular.
   */
  public get modelNames() {
    return Object.keys(this._singularToPlural);
  }

  /**
   * The models which are known to this `DexieModel` instance.
   * The names will be in the _plural_ vernacular.
   */
  public get pluralNames() {
    return Object.keys(this._models);
  }

  public get db(): Readonly<Dexie> {
    return this._db;
  }

  public get status() {
    return this._status;
  }

  public get isMapped() {
    return this._isMapped;
  }

  /** simple dictionary of Dixie model defn's for indexation */
  private _models: IDictionary<string> = {};
  private _constructors: IDictionary<IModelConstructor<any>> = {};
  /** the core **Dexie** API surface */
  private _db: Dexie;
  /** META information for each of the `Model`'s */
  private _meta: IDictionary<IDexieModelMeta> = {};
  /** maps `Model`'s singular name to a plural */
  private _singularToPlural: IDictionary<string> = {};
  /** the current version number for the indexDB database */
  private _currentVersion: number = 1;
  private _priors: IDexiePriorVersion[] = [];
  /** flag to indicate whether the Dexie DB has begun the initialization */
  private _isMapped: boolean = false;

  private _status: string = "initialized";

  constructor(private _name: string, ...models: Array<IModelConstructor<any>>) {
    this._models = DexieDb.modelConversion(...models);

    this._db = DexieDb._indexedDb
      ? new Dexie(this._name, { indexedDB: DexieDb._indexedDb })
      : new Dexie(this._name);

    this._db.on("blocked", () => {
      this._status = "blocked";
    });
    this._db.on("populate", () => {
      this._status = "populate";
    });
    this._db.on("ready", () => {
      this._status = "ready";
    });

    models.forEach(m => {
      const r = Record.create(m);
      this._constructors[r.pluralName] = m;
      this._meta[r.pluralName] = {
        ...r.META,
        modelName: r.modelName,
        hasDynamicPath: r.hasDynamicPath,
        dynamicPathComponents: r.dynamicPathComponents,
        pluralName: r.pluralName
      };
      this._singularToPlural[r.modelName] = r.pluralName;
    });
  }

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
  public addPriorVersion(version: IDexiePriorVersion) {
    this._priors.push(version);
    this._currentVersion++;

    return this;
  }

  /**
   * Returns a typed **Dexie** `Table` object for a given model class
   */
  public table(tbl: string) {
    if (!this.isMapped) {
      this.mapModels();
    }
    if (!this.isOpen()) {
      this.open();
    }
    if (!this._models[tbl]) {
      const singular = this._singularToPlural[tbl] ? true : false;
      if (singular) {
        throw new DexieError(
          `Attempt to call DexieDb.table("${tbl}") failed because Dexie organizes tables by a model's PLURAL name. There is a model called "${tbl}" but the table name is "${this._singularToPlural[tbl]}"`,
          "dexie/table-does-not-exist"
        );
      } else {
        throw new DexieError(
          `Attempt to call DexieDb.table("${tbl}) failed because there is no known table of that name. The tables which Dexie is currently aware of are: ${this.pluralNames}`,
          "dexie/table-does-not-exist"
        );
      }
    }
    const model = this.modelConstructor(tbl);
    const table = this._db.table(tbl);
    table.mapToClass(model);

    return table;
  }

  /**
   * Provides a **Firemodel**-_like_ API surface to interact with singular
   * records.
   *
   * @param model the **Firemodel** `Model` name
   */
  public record(model: string) {
    if (!this._models[model]) {
      const isPlural = this.pluralNames.includes(model);
      throw new DexieError(
        `Attempt to reach the record API via DexieDb.record("${model}") failed as there is no known Firemodel model of that name. ${
          isPlural
            ? "It looks like you may have accidentally used the plural name instead"
            : ""
        }`,
        "dexie/model-does-not-exist"
      );
    }
    if (!this.isOpen()) {
      this.open();
    }
    return new DexieRecord(
      this.table(this._singularToPlural[model]),
      this.meta(model)
    );
  }

  /**
   * Provides a very **Firemodel**-_like_ API surface to interact with LIST based
   * queries.
   *
   * @param model the **Firemodel** `Model` name
   */
  public list(model: string) {
    if (!this.isMapped) {
      this.mapModels();
    }
    if (!this.isOpen()) {
      this.open();
    }
  }

  /**
   * Returns the META for a given `Model` identified by
   * the model's _plural_ (checked first) or _singular_ name.
   */
  public meta(name: string, _originated: string = "meta"): IDexieModelMeta {
    return this._checkPluralThenSingular(this._meta, name, _originated);
  }

  /**
   * Returns a constructor for a given **Firemodel** `Model`
   *
   * @param name either the _plural_ or _singular_ name of a model
   * managed by the `DexieModel` instance
   */
  public modelConstructor(name: string): IModelConstructor<any> {
    return this._checkPluralThenSingular(
      this._constructors,
      name,
      "modelConstructor"
    );
  }

  /**
   * Checks whether the connection to the **IndexDB** is open
   */
  public isOpen(): boolean {
    return this._db.isOpen();
  }

  /**
   * Sets all the defined models (as well as priors) to the
   * Dexie DB instance.
   */
  public mapModels() {
    this._mapVersionsToDexie();
    this._status = "mapped";
    this._isMapped = true;
  }

  /**
   * Opens the connection to the **IndexDB**.
   *
   * Note: _if the **Firemodel** models haven't yet been mapped to Dexie
   * then they will be prior to openning the connection._
   */
  public async open() {
    if (this._db.isOpen()) {
      throw new DexieError(
        `Attempt to call DexieDb.open() failed because the database is already open!`,
        `dexie/db-already-open`
      );
    }
    if (!this.isMapped) {
      this.mapModels();
    }
    return this._db.open();
  }

  /**
   * Closes the IndexDB connection
   */
  public close() {
    if (!this._db.isOpen()) {
      throw new DexieError(
        `Attempt to call DexieDb.close() failed because the database is NOT open!`,
        `dexie/db-not-open`
      );
    }
    this._db.close();
  }

  private _checkPluralThenSingular(obj: IDictionary, name: string, fn: string) {
    if (obj[name]) {
      return obj[name];
    } else if (this._singularToPlural[name]) {
      return obj[this._singularToPlural[name]];
    }

    throw new DexieError(
      `Failed while calling DexieModel.${fn}("${name}") because "${name}" is neither a singular or plural name of a known model!`,
      `firemodel/invalid-dexie-model`
    );
  }

  private _mapVersionsToDexie() {
    this._priors.forEach((prior, idx) => {
      if (prior.upgrade) {
        this._db
          .version(idx + 1)
          .stores(prior.models)
          .upgrade(prior.upgrade);
      } else {
        this._db.version(idx).stores(prior.models);
      }
    });

    this._db.version(this._currentVersion).stores(this.models);
    this._isMapped = true;
  }
}
