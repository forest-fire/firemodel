import { IDictionary, datetime } from 'common-types';
import DB, { Snapshot } from 'abstracted-admin';
import { SchemaCallback } from 'firemock';
import * as moment from 'moment';
import * as path from 'path';
import * as pluralize from 'pluralize';
import { camelCase } from 'lodash';
import { BaseSchema } from './base-schema';
import { Record } from './record';
import { List } from './list';

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
  msg: (message: string) => void,
  warn: (message: string) => void,
  error: (message: string) => void
}

const baseLogger = {
  msg: (message: string) => console.log(`${this.modelName}/${this._key}: ${message}`),
  warn: (message: string) => console.warn(`${this.modelName}/${this._key}: ${message}`),
  error: (message: string) => console.error(`${this.modelName}/${this._key}: ${message}`),
};

/** The primary key for the given record */
export type PrimaryKey = string;
/** A pointer to a 1:1 entity relationship */
export type BelongsTo = string;
/** A pointer to a 1:M entity relationship */
export type HasMany = IDictionary<boolean>;
/** A pointer to a M:M entity relationship */
export type ManyMany = IDictionary<boolean>;

export default class Model<T extends BaseSchema> {
  /** A singular data record of the given type */
  public record: T;
  /** the singular name of the model */
  public get modelName() {
    return camelCase(this.record.constructor.name);
  };
  public get pluralName() {
    return this._pluralName
      ? this._pluralName
      : pluralize.plural(this.modelName)
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

  constructor(
    private schemaClass: new () => T,
    db: DB,
    logger?: ILogger
  ) {
    this._db = db;
    this.logger = logger ? logger : baseLogger;
    // this._db.mock.addSchema(this.modelName, this._mockGenerator);
  }

  public newRecord(hash: Partial<T> = {}) {
    const schema = new this.schemaClass();
    // Object.keys(hash).map((key: keyof T) => schema[key] = hash[key]);
    const record = new Record(this.schemaClass, this._db);
    record.initialize(hash);
    return record;
  }

  public async getRecord(id: string) {
    const record = new Record<T>(
      this.schemaClass,
      this._db
    );
    return await record.load(id);
  }

  // public generate(quantity: number, override: IDictionary = {}) {
  //   this._db.mock.queueSchema<T>(this.modelName, quantity, override);
  //   this._db.mock.generate();
  // }

  // protected _mockGenerator: SchemaCallback = (h) => () => {
  //   return this._bespokeMockGenerator
  //     ? { ...this._defaultGenerator(h)(), ...this._bespokeMockGenerator(h)() as IDictionary}
  //     : this._defaultGenerator(h)();
  // }

  // private _defaultGenerator: SchemaCallback = (h) => () => ({
  //   createdAt: moment(h.faker.date.past()).toISOString(),
  //   lastUpdated: moment().toISOString()
  // });
}

