import { IDictionary, datetime } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB, rtdb } from "abstracted-firebase";
import { VerboseError } from "./VerboseError";
import { ISchemaMetaProperties, BaseSchema, Record, List } from "./index";
import { SchemaCallback } from "firemock";
import * as moment from "moment";
// import * as path from 'path';
import * as pluralize from "pluralize";
import camelCase = require("lodash.camelcase");
import { SerializedQuery } from "serialized-query";
import { snapshotToArray, ISnapShot, arrayToHash } from "typed-conversions";
import { slashNotation, createError } from "./util";
import { key as fbk } from "firebase-key";
import Reference from "../../firemock/lib/reference";

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
  msg: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export interface IAuditFilter {
  /** audit entries since a given unix epoch timestamp */
  since?: number;
  /** the last X number of audit entries */
  last?: number;
}

export type FirebaseCrudOperations = "push" | "set" | "update" | "remove";

export interface IAuditRecord {
  crud: FirebaseCrudOperations;
  when: datetime;
  schema: string;
  key: string;
  info: IDictionary;
}

export type ConditionAndValue = [string, any];

const baseLogger = {
  msg: (message: string) => console.log(`${this.modelName}/${this._key}: ${message}`),
  warn: (message: string) => console.warn(`${this.modelName}/${this._key}: ${message}`),
  error: (message: string) => console.error(`${this.modelName}/${this._key}: ${message}`)
};

export default class Model<T extends BaseSchema> {
  //#region PROPERTIES

  /** The base path in the database to store audit logs */
  public static auditBase = "logging/audit_logs";
  /** Instantiation of schema class for meta analysis */
  protected _record: T;
  /** the singular name of the model */
  public get modelName() {
    return camelCase(this._record.constructor.name);
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

  private _db: RealTimeDB;
  private _key: string;
  private _snap: rtdb.IDataSnapshot;
  private _retrievingRecord: Promise<rtdb.IDataSnapshot>;

  //#endregion

  constructor(private schemaClass: new () => T, db: RealTimeDB, logger?: ILogger) {
    this._db = db;
    this.logger = logger ? logger : baseLogger;
    this._record = new this.schemaClass();
  }

  //#region PUBLIC API

  public get dbPath() {
    return [this._record.META.dbOffset, this.pluralName].join(".");
  }

  public get localPath() {
    return [this._record.META.localOffset, this.pluralName].join(".");
  }

  public get relationships() {
    return this._record.META.relationships;
  }

  public get properties() {
    return this._record.META.properties;
  }

  public get pushKeys() {
    return this._record.META ? this._record.META.pushKeys : [];
  }

  public newRecord(hash?: Partial<T>) {
    return new Record<T>(this.schemaClass, this.pluralName, this._db, this.pushKeys, hash);
  }

  public async getRecord(id: string) {
    const record = new Record<T>(this.schemaClass, this.pluralName, this._db, this.pushKeys);
    return record.load(id);
  }

  public async getAll() {
    const list = new List<T>(this.schemaClass, this.pluralName, this._db);
    return list.load(this.dbPath);
  }

  public getSome(): SerializedQuery<T> {
    const [schemaClass, pluralName, db] = [this.schemaClass, this.pluralName, this._db];
    const query = SerializedQuery.path<T>(this.dbPath)
      .setDB(this._db)
      .handleSnapshot(snap => new List<T>(schemaClass, pluralName, db, snapshotToArray<T>(snap)));
    return query;
  }

  /**
   * Finds a single records within a list
   *
   * @param prop the property on the Schema which you are looking for a value in
   * @param value the value you are looking for the property to equal; alternatively you can pass a tuple with a comparison operation and a value
   */
  public async findRecord(prop: keyof T, value: string | number | boolean | ConditionAndValue) {
    let operation: string = "=";
    if (value instanceof Array) {
      operation = value[0];
      value = value[1];
    }

    const query = this._findBuilder(prop, value, true);
    const results = await this._db.getList<T>(query);
    console.log("list is:", results);

    if (results.length > 0) {
      const record = this.newRecord(results.pop());
      console.log("RECORD", record);

      return record;
    } else {
      throw new VerboseError({
        code: "not-found",
        message: `Not Found: didn't find any ${
          this.pluralName
        } which had "${prop}" set to "${value}"; note the path in the database which was searched was "${
          this.dbPath
        }".`,
        module: "findRecord"
      });
    }
  }

  public async findAll(prop: keyof T, value: string | number | boolean | ConditionAndValue) {
    const query = this._findBuilder(prop, value);
    let results;
    try {
      results = await this._db.getList<T>(query);
    } catch (e) {
      console.log("Error attempting to findAll() in Model.", e);
      createError(
        e,
        "model/findAll",
        `Failed getting via getList() with query` + JSON.stringify(query, null, 2),
        [{ prop, value, query }]
      );
    }
    return new List<T>(this.schemaClass, this.pluralName, this._db, results);
  }

  /** sets a record to the database */
  public async set(record: T, auditInfo: IDictionary = {}) {
    if (!record.id) {
      throw createError(
        null,
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

  /** Push a new record onto a model's list using Firebase a push-ID */
  public async push(newRecord: Partial<T>, auditInfo: IDictionary = {}) {
    const now = this.now();
    newRecord = {
      ...(newRecord as any),
      ...{ lastUpdated: now, createdAt: now }
    };
    auditInfo = {
      ...auditInfo,
      ...{ properties: Object.keys(newRecord) }
    };

    const ref = await this.crud(
      "push",
      now,
      slashNotation(this.dbPath, fbk()),
      newRecord,
      auditInfo
    );
    return ref as rtdb.IReference<T>;
  }

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
   * Performs a Firebase "update" on multiple dbPaths where the whole set of changes
   * are treated as an "atomic" transaction. Note, however, that unlike a normal "update",
   * a partial record will destructively update with Firebase's default behavor. To retain the
   * non-destructive behavior we must discretely update/set the individual properties of each record.
   *
   * @param payload an array of records -- all with the 'id' property
   */
  public async multiPathUpdate(payload: T[]) {
    const now = this.now();
    const updates: IDictionary = {};
    payload.map(record => {
      record.lastUpdated = now;
      const basePath = slashNotation(this.dbPath, record.id);
      Object.keys(record)
        .filter(p => p !== "id")
        .map((prop: keyof T) => {
          updates[slashNotation(basePath, prop)] = record[prop];
        });
    });

    await this._db.ref("/").update(updates);

    return;
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
  public async remove(key: string, returnValue: boolean = false, auditInfo: IDictionary = {}) {
    const now = this.now();
    let value: T;
    if (returnValue) {
      value = await this._db.getValue<T>(key);
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
    const path = `${Model.auditBase}/${this.pluralName}`;
    let query = SerializedQuery.path<IAuditRecord>(path);
    if (since) {
      const startAt = moment(since).toISOString();
      query = query.orderByChild("when").startAt(startAt);
    }
    if (last) {
      query = query.limitToLast(last);
    }

    return this._db.getList<IAuditRecord>(query);
  }
  //#endregion

  //#region PRIVATE API
  private async audit(crud: string, when: string, key: string, info: IDictionary) {
    const path = slashNotation(Model.auditBase, this.pluralName);
    return this._db.push(path, {
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
    when: string,
    key: string,
    value?: Partial<T>,
    auditInfo?: IDictionary
  ) {
    const isAuditable = this._record.META.audit;
    const auditPath = slashNotation(Model.auditBase, this.pluralName, key);
    let auditRef;
    if (isAuditable) {
      auditRef = await this.audit(op, when, key, auditInfo);
    }

    switch (op) {
      case "set":
        return this._db.set<T>(key, value as T);
      case "update":
        return this._db.update<T>(key, value);
      case "push":
        // PUSH unlike SET returns a reference to the newly created record
        return this._db.set<T>(key, value as T).then(() => this._db.ref(key));
      case "remove":
        return this._db.remove<T>(key);

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
    value: string | number | boolean | ConditionAndValue,
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
      case ">=":
        return query.startAt(value);
      case "<=":
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
    this._db.mock.queueSchema<T>(this.modelName, quantity, override);
    this._db.mock.generate();
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
    createdAt: moment(h.faker.date.past()).toISOString(),
    lastUpdated: moment().toISOString()
  });
  //#endregion

  private now() {
    return new Date().toISOString();
  }

  private logToAuditTrail(key: string, crud: string, info: IDictionary) {
    //
  }
  //#endregion
}
