import { IDictionary, datetime } from 'common-types';
import DB, { Snapshot, Reference } from 'fireadmin';
// import * as ut from '../shared/u-transporter';
// import Context from '../shared/context';
// import Logger from '../shared/logger';
import * as moment from 'moment';
import * as path from 'path';

const context = new Context();
let log: Logger;

const capitalize = (word: string) => {
  return word ? word.slice(0, 1).toUpperCase() + word.slice(1) : '';
};

const pluralize = (word: string) => {
  return word + 's';
};

const lookUp = (target: any) => (prop: string) => (target ? target[prop] : '');

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

/** The primary key for the given record */
export type PrimaryKey = string;
/** A pointer to a 1:1 entity relationship */
export type BelongsTo = string;
/** A pointer to a 1:M entity relationship */
export type HasMany = IDictionary<boolean>;
/** A pointer to a M:M entity relationship */
export type ManyMany = IDictionary<boolean>;

export default abstract class Model<T = IBaseModel> {
  protected _record: Partial<T>;
  protected abstract readonly model: string;
  /**
   * the property from the record which is best apt to
   * describe the individual item in a human readable way
   */
  protected descriptiveProperty: string = 'name';
  protected rec = lookUp(this._record);
  protected offset: string = '';
  protected watching = false;
  private _db: DB;
  private _id: string;
  private _retrievingRecord: Promise<Snapshot>;

  constructor() {
    if (!log) {
      log = new Logger('[Super] → Model');
    }
  }

  public get modelName() {
    return this.model;
  }

  public get dbPath() {
    return '/' + path.join(this.offset, this.pluralName, this.id || '');
  }

  public get pluralName() {
    return pluralize(this.model);
  }

  /** the unique ID for the database record */
  public get id() {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
    log = new Logger(`${capitalize(this.model)} → Model`);
  }

  /**
   * Provides a fluent-api for setting the ID
   */
  public setId(value: string) {
    this.id = value;
    return this;
  }

  /**
   * Loads a record from Firebase
   */
  public async load(id: string) {
    if (this.watching) {
      return Promise.reject({
        code: 'not-allowed',
        message: 'You can not load a record which is already being watched'
      });
    }
    if (!id) {
      return Promise.reject({
        code: 'no-id',
        message: 'No "id" was passed into load'
      });
    }

    this.id = id;
    return this.db.getValue<T>(this.dbPath).then(record => {
      this.record = record;
      return record
        ? Promise.resolve(this)
        : Promise.reject({
            code: 'not-found',
            message: `The ${capitalize(this.modelName)} "${this
              .id}" was not found in the database [${this.dbPath}].`
          });
    });
  }

  /** keeps a persistent watch on a DB record */
  public watch(cb: (value: Snapshot) => any) {
    if (!this.id) {
      return Promise.reject({
        code: 'no-id',
        message: `Attempt to watch before setting the record's ID.`
      });
    }

    this.watching = true;
    this.db.ref(this.dbPath).on('value', cb);
    return Promise.resolve();
  }

  /**
   * Add the model into the collection using Firebase's
   * pushkey facility.
   */
  public add(hash?: IDictionary): Promise<this> {
    if (this._id) {
      return Promise.reject(
        `You can not "add" a new ${capitalize(
          this.model
        )} when the "id" property is already set`
      );
    }

    const now = moment().toISOString();
    const record = this.record as IDictionary;

    return this.db
      .ref(`${pluralize(this.model)}`)
      .push({
        ...hash,
        ...record,
        ...{ lastUpdated: now, createdAt: now }
      })
      .then(ref => ref.once('value'))
      .then(snap => {
        this.id = snap.key;
        this._record = convert.snapshotToHash<T>(snap);
        return this;
      });
  }

  /**
   * Update the record selectively with a hash of update
   * values
   */
  public async update(updateWith: IDictionary = {}) {
    if (!this.id) {
      return this.missingId(`Can't update ${capitalize(this.model)}`);
    }

    const reference = `/${pluralize(this.model)}/${this.id}`;
    return this.db
      .update(reference, {
        ...this.record as IDictionary,
        ...updateWith,
        ...{ lastUpdated: moment().toISOString() }
      })
      .then(() => this.db.getValue<T>(this.dbPath))
      .then(r => {
        this.record = r as T;
        return Promise.resolve();
      })
      .catch((err: any) => {
        log.error(
          `Problem updating ${capitalize(
            this.model
          )} ${this.description()}: ${err.msg || err}.`
        );
        return Promise.reject(err);
      });
  }

  public get record() {
    return this._record as T;
  }

  /**
   * Allows setting properties on the Model with a single call.
   * Since the internal represetation of the model is a "Partial"
   * model, properties are not "required" but only valid properties
   * may be used.
   */
  public set record(value: Partial<T>) {
    const now: datetime = moment().toISOString();
    const createdAt: datetime = this.rec('createdAt') || now;
    const timeInfo: Partial<IBaseModel> = { lastUpdated: now, createdAt };
    // TODO: bring this back in once Typescript bug is fixed
    // this._record = { ...value, ...timeInfo };
    this._record = value;
    log = new Logger(`${capitalize(this.model)} → Model`);
  }

  /**
   * Allows setting individual properties on the record
   *
   * @param key the property on the record you want to set
   * @param value the value of the property
   */
  public setValue<K extends keyof T>(key: K, value: T[K]) {
    if (!this._record) {
      this._record = {};
    }
    this._record[key] = value;
    return this;
  }

  /**
   * Allows setting an individual property on a record where the property
   * must be an array and result of the operation is the addition
   * of a new array element
   *
   * @param key the property on the record you want to add to
   * @param value an element to add to the existing array
   */
  public pushValue<K extends keyof T>(key: K, value: T[K]) {
    const val = this._record[key];
    if (!val) {
      this._record[key] = [value] as any;
    } else if (Array.isArray(val)) {
      val.push(value);
    } else {
      throw new Error(
        `Property ${key} on ${this
          .modelName} is not an array so values may not be pushed onto it.`
      );
    }
  }

  public async addToRelationship<K extends keyof T>(key: K, fk: string) {
    const relationship = this._record[key] || {} as any;
    if (typeof relationship !== 'object') {
      return Promise.reject({
        code: 'not-object',
        message: `Failed to add new relationship to "${this
          .modelName}/${key}" because the ${key} property was not an object.`
      });
    } else {
      const fkRef: boolean = relationship[fk];
      if (fkRef) {
        return Promise.reject({
          code: 'already-exists',
          message: `Failed to add new relationship to "${this
            .modelName}/${key}" because this FK was already set`
        });
      }

      this.setValue(key, {
        ...relationship,
        ...{ [fk]: true }
      });
    }
  }

  protected get db() {
    if (this._db) {
      return this._db;
    }

    this._db = new DB();
    return this._db;
  }

  protected description() {
    return `${this.rec(this.descriptiveProperty)}[${this.id}]`;
  }

  protected missingId(msg: string) {
    return log.reject({
      code: 'task/missing-id',
      message: `${msg} ${this.description()}: no "id" was set for task`
    });
  }
}

