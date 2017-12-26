import { IDictionary, datetime, VerboseError } from "common-types";
import { ISchemaMetaProperties, BaseSchema, Record, List } from "./index";
import DB, { Snapshot } from "abstracted-admin";
import { SchemaCallback } from "firemock";
import * as moment from "moment";
// import * as path from 'path';
import * as pluralize from "pluralize";
import { camelCase } from "lodash";
import { SerializedQuery } from "serialized-query";
import { snapshotToArray, ISnapShot } from "typed-conversions";
import { slashNotation } from "./util";

export type ModelProperty<T> = keyof T | keyof IBaseModel;
export type PartialModel<T> = {
  [P in keyof ModelProperty<T>]?: ModelProperty<T>[P]
};

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
  msg: (message: string) =>
    console.log(`${this.modelName}/${this._key}: ${message}`),
  warn: (message: string) =>
    console.warn(`${this.modelName}/${this._key}: ${message}`),
  error: (message: string) =>
    console.error(`${this.modelName}/${this._key}: ${message}`)
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
    return this._pluralName
      ? this._pluralName
      : pluralize.plural(this.modelName);
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

  private _db: DB;
  private _key: string;
  private _snap: Snapshot;
  private _retrievingRecord: Promise<Snapshot>;

  //#endregion

  constructor(private schemaClass: new () => T, db: DB, logger?: ILogger) {
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

  public newRecord(hash: Partial<T> = {}) {
    return new Record(this.schemaClass, this.pluralName, this._db, hash);
  }

  public async getRecord(id: string) {
    const record = new Record<T>(this.schemaClass, this.pluralName, this._db);
    return await record.load(id);
  }

  public async getAll() {
    const list = new List<T>(this.schemaClass, this.pluralName, this._db);
    return await list.load(this.dbPath);
  }

  public getSome(): SerializedQuery<T> {
    const [schemaClass, pluralName, db] = [
      this.schemaClass,
      this.pluralName,
      this._db
    ];
    const query = SerializedQuery.path<T>(this.dbPath)
      .setDB(this._db)
      .handleSnapshot(
        snap =>
          new List<T>(schemaClass, pluralName, db, snapshotToArray<T>(snap))
      );
    return query;
  }

  public async findRecord(
    prop: string,
    value: string | number | boolean | ConditionAndValue
  ) {
    let operation: string = "=";
    if (value instanceof Array) {
      operation = value[0];
      value = value[1];
    }

    const query = this._findBuilder(prop, value, true);
    const results = await this._db.getList<T>(query);

    if (results.length > 0) {
      return this.newRecord(results.pop());
    } else {
      throw new VerboseError({
        code: "not-found",
        message: `Not Found: didn't find any ${this
          .pluralName} which had "${prop}" set to "${value}"; note the path in the database which was searched was "${this
          .dbPath}".`,
        module: "findRecord"
      });
    }
  }

  public async findAll(
    prop: string,
    value: string | number | boolean | ConditionAndValue
  ) {
    const query = this._findBuilder(prop, value);
    const results = await this._db.getList<T>(query);
    return new List<T>(this.schemaClass, this.pluralName, this._db, results);
  }

  /** sets a record to the database */
  public async set(record: T, auditInfo: IDictionary = {}) {
    const now = this.now();
    record = {
      ...(record as any),
      ...{ lastUpdated: now }
    };
    auditInfo = {
      ...auditInfo,
      ...{ properties: Object.keys(record) }
    };
    const ref = await this.crud("set", now, null, record, auditInfo);

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
    const ref = await this.crud("push", now, null, newRecord, auditInfo);

    return ref;
  }

  public async update(
    key: string,
    updates: Partial<T>,
    auditInfo: IDictionary = {}
  ) {
    const now = this.now();
    auditInfo = {
      ...{ auditInfo },
      ...{ updatedProperties: Object.keys(updates) }
    };
    updates = {
      ...(updates as any),
      ...{ lastUpdated: now }
    };

    await this.crud("update", now, key, updates, auditInfo);
    return;
  }

  /**
   * Remove
   *
   * Remove a record from the database
   *
   * @param key         the specific record which is to be removed
   * @param returnValue optionally pass back the deleted record along removing from server
   * @param auditInfo   any additional information to be passed to the audit record (if Model has turned on)
   */
  public async remove(
    key: string,
    returnValue: boolean = false,
    auditInfo: IDictionary = {}
  ) {
    const now = this.now();
    const path = slashNotation(this.dbPath, key);
    let value: T;
    if (returnValue) {
      value = await this._db.getRecord(path);
    }
    await this.crud("remove", now, key, null, auditInfo);

    return value;
  }

  public async getAuditTrail(filter: IAuditFilter = {}) {
    const { since, last } = filter;
    const path = `${Model.auditBase}/${this.pluralName}`;
    let query = SerializedQuery.path(path);
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
  private async audit(
    crud: string,
    when: string,
    key: string,
    info: IDictionary
  ) {
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
    const recordPath = slashNotation(this.dbPath, key);
    let auditRef;
    if (isAuditable) {
      auditRef = await this.audit(op, when, key, auditInfo);
    }

    switch (op) {
      case "set":
        return this._db.set<T>(recordPath, value as T);
      case "update":
        return this._db.update<T>(recordPath, value);
      case "push":
        return this._db[op]<T>(recordPath, value as T);
      case "remove":
        return this._db[op]<T>(recordPath);

      default:
        throw new VerboseError({
          code: "unknown-operation",
          message: `The operation "${op}" is not known!`,
          module: "crud"
        });
    }
  }

  private _findBuilder(
    child: string,
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
