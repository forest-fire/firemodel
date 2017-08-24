import { IDictionary, datetime } from 'common-types';
import DB, { Snapshot } from 'abstracted-admin';
import * as moment from 'moment';
import * as path from 'path';

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

export interface ILogger {
  log: (message: string) => void,
  warn: (message: string) => void,
  error: (message: string) => void
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
  /** the singular name of the model */
  protected name: string;
  /** A singular data record of the given type */
  protected record: Partial<T>;
  /** A list of records */
  protected list: T[];
  /** A fixed path that should prefix the model in the database */
  protected prefix: string = '';
  /** The basic message logger being used */
  protected logger: ILogger;

  private _db: DB;
  private _key: string;
  private _snap: Snapshot;
  private _retrievingRecord: Promise<Snapshot>;

  constructor(db: DB, logger?: ILogger) {
    this._db = db;
    this.logger = logger ? logger : {
      log: (message: string) => console.log(message),
      warn: (message: string) => console.warn(message),
      error: (message: string) => console.error(message),
    };
  }
}

