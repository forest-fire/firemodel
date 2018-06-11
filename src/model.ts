import { IDictionary, datetime, createError } from "common-types";
import { VerboseError } from "./VerboseError";
import { BaseSchema, Record, List } from ".";
import { SchemaCallback } from "firemock";
import * as pluralize from "pluralize";
import { camelCase } from "lodash";
import { SerializedQuery } from "serialized-query";
import { slashNotation } from "./util";
import { key as fbk } from "firebase-key";
import {
  ISchemaRelationshipMetaProperties,
  ISchemaMetaProperties
} from "./decorators/schema";
import { FireModel } from "./FireModel";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";

export type ModelProperty<T> = keyof T | keyof IBaseModel;
export type PartialModel<T> = { [P in keyof ModelProperty<T>]?: ModelProperty<T>[P] };

/**
 * all models should extend the base model therefore we can
 * expect these properties to always exist
 */
export interface IBaseModel {
  createdAt: datetime;
  lastUpdated: datetime;
}

export interface ILogger {
  log: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
}

export interface IAuditFilter {
  /** audit entries since a given unix epoch timestamp */
  since?: number;
  /** the last X number of audit entries */
  last?: number;
}

export type IComparisonOperator = "=" | ">" | "<";
export type IConditionAndValue = [IComparisonOperator, boolean | string | number];
export type FirebaseCrudOperations = "push" | "set" | "update" | "remove";

export interface IAuditRecord {
  crud: FirebaseCrudOperations;
  when: datetime;
  schema: string;
  key: string;
  info: IDictionary;
}

export interface IModelOptions {
  logger?: ILogger;
  db?: import("abstracted-firebase").RealTimeDB;
}

export const baseLogger: ILogger = {
  log: (message: string) => console.log(`${this.modelName}/${this._key}: ${message}`),
  warn: (message: string) => console.warn(`${this.modelName}/${this._key}: ${message}`),
  debug: (message: string) => {
    const stage = process.env.STAGE || process.env.AWS_STAGE || process.env.ENV;
    if (stage !== "prod") {
      console.log(`${this.modelName}/${this._key}: ${message}`);
    }
  },
  error: (message: string) => console.error(`${this.modelName}/${this._key}: ${message}`)
};

export class OldModel<T extends BaseSchema> extends FireModel<T> {
  public static set defaultDb(db: RealTimeDB) {
    FireModel.defaultDb = db;
  }
  public static get defaultDb() {
    return FireModel.defaultDb;
  }
  //#region PROPERTIES
  /** The base path in the database to store audit logs */
  public static auditBase = "logging/audit_logs";

  public static create<T>(schema: new () => T, options: IModelOptions = {}) {
    const db = options.db || OldModel.defaultDb;
    const logger = options.logger || baseLogger;
    const model = new OldModel<T>(schema, db, logger);
    return model;
  }

  /** Instantiation of schema class for meta analysis */
  protected _schema: T;
  /** the singular name of the model */
  public get modelName() {
    return camelCase(this._schema.constructor.name);
  }
  public get pluralName() {
    return this._pluralName ? this._pluralName : pluralize.plural(this.modelName);
  }

  public set pluralName(name: string) {
    this._pluralName = name;
  }

  public set mockGenerator(cb: SchemaCallback) {
    this._bespokeMockGenerator = cb;
  }

  protected logger: ILogger;
  /** allows for pluralized name of the model to be set explicitly */
  protected _pluralName: string;

  private _bespokeMockGenerator: SchemaCallback<T>;

  /**
   * All access to the database is done via a passed in dependency which
   * meets the contracts specified by the RealTimeDB interface
   */
  private _db: RealTimeDB;

  //#endregion

  constructor(private _schemaClass: new () => T, db: RealTimeDB, logger?: ILogger) {
    super();
    this._db = db;
    if (!OldModel.defaultDb) {
      OldModel.defaultDb = db;
    }
    this.logger = logger ? logger : baseLogger;
    this._schema = new this.schemaClass();
  }

  //#region PUBLIC API
  public get schemaClass() {
    return this._schemaClass;
  }

  /** Database access */
  public get db() {
    return this._db;
  }

  public get schema() {
    return this._schema;
  }

  public get dbPath() {
    return [this._schema.META.dbOffset, this.pluralName].join(".");
  }

  public get localPath() {
    return [this._schema.META.localOffset, this.pluralName].join(".");
  }

  public get relationships(): ISchemaRelationshipMetaProperties[] {
    return this._schema.META.relationships;
  }

  public get properties(): ISchemaMetaProperties[] {
    return this._schema.META.properties;
  }

  public get pushKeys() {
    return this._schema.META ? this._schema.META.pushKeys : [];
  }

  // /**
  //  * Add a new record of type T, optionally including the payload
  //  *
  //  * @param hash the values that you want this new object to be initialized as; note that if you include an "id" property it will assume this is from the DB, if you don't then it will immediately add it and create an id.
  //  */
  // public async newRecord(hash?: Partial<T>) {
  //   console.log(this.schemaClass);

  //   return hash
  //     ? Record.add(this.schemaClass, hash as T, { db: this.db })
  //     : Record.create(this.schemaClass, { db: this.db });
  // }

  /**
   * Get an existing record from the  DB and return as a Record
   *
   * @param id the primary key for the record
   */
  public async getRecord(id: string) {
    const record = await Record.get(this._schemaClass, id);
    return record;
  }

  /**
   * Returns a list of ALL objects of the given schema type
   */
  public async getAll(query?: SerializedQuery) {
    const list = new List<T>(this);
    return query ? list.load(query) : list.load(this.dbPath);
  }

  /**
   * Finds a single records within a list
   *
   * @param prop the property on the Schema which you are looking for a value in
   * @param value the value you are looking for the property to equal; alternatively you can pass a tuple with a comparison operation and a value
   */
  public async findRecord(
    prop: keyof T,
    value: string | number | boolean | IConditionAndValue
  ) {
    const query = this._findBuilder(prop, value, true);
    const results = await this.db.getList<T>(query);

    if (results.length > 0) {
      const first = results.pop();
      const record = Record.get(this._schemaClass, first.id);
      return record;
    } else {
      throw createError(
        "not-found",
        `Not Found: didn't find any "${
          this.pluralName
        }" which had "${prop}" set to "${value}"; note the path in the database which was searched was "${
          this.dbPath
        }".`
      );
    }
  }

  public async findAll(
    prop: keyof T,
    value: string | number | boolean | IConditionAndValue
  ): Promise<List<T>> {
    const query = this._findBuilder(prop, value);
    let results;
    try {
      results = await this.db.getList<T>(query);
    } catch (e) {
      console.log("Error attempting to findAll() in Model.", e);
      throw createError(
        "model/findAll",
        `\nFailed getting via getList() with query` + JSON.stringify(query, null, 2),
        e
      );
    }
    return new List<T>(this, results);
  }

  /** sets a record to the database */
  public async set(record: T, auditInfo: IDictionary = {}) {
    if (!record.id) {
      throw createError(
        "set/no-id",
        `Attempt to set "${this.dbPath}" in database but record had no "id" property.`
      );
    }
    const now = this.now();
    record = {
      ...(record as any),
      ...{ lastUpdated: now }
    };
    auditInfo = {
      ...auditInfo,
      ...{ properties: Object.keys(record) }
    };
    const ref = await this.crud(
      "set",
      now,
      slashNotation(this.dbPath, record.id),
      record,
      auditInfo
    );

    return ref;
  }

  /** Push a new record onto a model's list and returns a Firebase reference to this new record */
  public async push(newRecord: Partial<T>, auditInfo: IDictionary = {}) {
    const now = this.now();
    const id = fbk();
    newRecord = {
      ...(newRecord as any),
      ...{ lastUpdated: now, createdAt: now }
    };
    auditInfo = {
      ...auditInfo,
      ...{ properties: Object.keys(newRecord) }
    };
    console.log(newRecord, auditInfo);

    const response = await this.crud(
      "push",
      now,
      slashNotation(this.dbPath, id),
      newRecord,
      auditInfo
    );

    return response;
  }

  /** non-destructive update to a record's data */
  public async update(key: string, updates: Partial<T>, auditInfo: IDictionary = {}) {
    const now = this.now();
    auditInfo = {
      ...{ auditInfo },
      ...{ updatedProperties: Object.keys(updates) }
    };
    updates = {
      ...(updates as any),
      ...{ lastUpdated: now }
    };

    await this.crud("update", now, slashNotation(this.dbPath, key), updates, auditInfo);
  }

  /**
   * Remove
   *
   * Remove a record from the database
   *
   * @param key         the specific record id (but can alternatively be the full path if it matches dbPath)
   * @param returnValue optionally pass back the deleted record along removing from server
   * @param auditInfo   any additional information to be passed to the audit record (if Model has turned on)
   */
  public async remove(
    key: string,
    returnValue: boolean = false,
    auditInfo: IDictionary = {}
  ) {
    if (!key) {
      const e = new Error(
        `Trying to call remove(id) on a ${
          this.modelName
        } Model class can not be done when ID is undefined!`
      );
      e.name = "NotAllowed";
      throw e;
    }

    const now = this.now();
    let value: T;
    if (returnValue) {
      value = await this._db.getValue<T>(slashNotation(this.dbPath, key));
    }

    await this.crud(
      "remove",
      now,
      key.match(this.dbPath) ? key : slashNotation(this.dbPath, key),
      null,
      auditInfo
    );

    return returnValue ? value : undefined;
  }

  public async getAuditTrail(filter: IAuditFilter = {}) {
    const { since, last } = filter;
    const path = `${OldModel.auditBase}/${this.pluralName}`;
    let query = SerializedQuery.path<IAuditRecord>(path);
    if (since) {
      const startAt = new Date(since).toISOString();
      query = query.orderByChild("when").startAt(startAt);
    }
    if (last) {
      query = query.limitToLast(last);
    }

    return this.db.getList<IAuditRecord>(query);
  }
  //#endregion

  //#region PRIVATE API
  private async audit(crud: string, when: number, key: string, info: IDictionary) {
    const path = slashNotation(OldModel.auditBase, this.pluralName);
    return this.db.push(path, {
      crud,
      when,
      key,
      info
    });
  }

  /**
   * crud
   *
   * Standardized processing of all CRUD operations
   *
   * @param op The CRUD operation being performed
   * @param key The record id which is being performed on
   * @param value The new-value parameter (meaning varies on context)
   * @param auditInfo the meta-fields for the audit trail
   */
  private async crud(
    op: "set" | "update" | "push" | "remove",
    when: number,
    key: string,
    value?: Partial<T>,
    auditInfo?: IDictionary
  ) {
    const isAuditable = this._schema.META.audit;
    if (isAuditable) {
      await this.audit(op, when, key, auditInfo);
    }

    switch (op) {
      case "set":
        return this.db.set<T>(key, value as T);
      case "update":
        return this.db.update<T>(key, value);
      case "push":
        // PUSH unlike SET returns a reference to the newly created record
        return this.db.set<T>(key, value as T).then(() => this.db.ref(key));
      case "remove":
        return this.db.remove<T>(key);

      default:
        throw new VerboseError({
          code: "unknown-operation",
          message: `The operation "${op}" is not known!`,
          module: "crud"
        });
    }
  }

  private _findBuilder(
    child: keyof T,
    value: string | number | boolean | IConditionAndValue,
    singular: boolean = false
  ) {
    let operation: string = "=";
    if (value instanceof Array) {
      operation = value[0];
      value = value[1];
    }

    let query = SerializedQuery.path<T>(this.dbPath).orderByChild(child);
    if (singular) {
      query = query.limitToFirst(1);
    }
    switch (operation) {
      case "=":
        return query.equalTo(value);
      case ">":
        return query.startAt(value);
      case "<":
        return query.endAt(value);

      default:
        throw new VerboseError({
          code: "invalid-operation",
          message: `Invalid comparison operater "${operation}" used in find query`,
          module: "findXXX"
        });
    }
  }

  //#region mocking
  // tslint:disable-next-line:member-ordering
  public generate(quantity: number, override: IDictionary = {}) {
    this.db.mock.queueSchema<T>(this.modelName, quantity, override);
    this.db.mock.generate();
  }

  // tslint:disable-next-line:member-ordering
  protected _mockGenerator: SchemaCallback = h => () => {
    return this._bespokeMockGenerator
      ? {
          ...this._defaultGenerator(h)(),
          ...(this._bespokeMockGenerator(h)() as IDictionary)
        }
      : this._defaultGenerator(h)();
  };

  private _defaultGenerator: SchemaCallback = h => () => ({
    createdAt: new Date(h.faker.date.past()).toISOString(),
    lastUpdated: new Date().toISOString()
  });
  //#endregion

  private now() {
    return Date.now();
  }

  //#endregion
}
