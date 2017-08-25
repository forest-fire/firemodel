import { datetime } from 'common-types';

export abstract class BaseSchema {
  /** The primary-key for the record */
  public id?: string;
  /** The last time that a given model was updated */
  public lastUpdated?: datetime;
  /** The datetime at which this record was first created */
  public createdAt?: datetime;
}
