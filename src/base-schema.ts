import { IDictionary, datetime } from 'common-types';
import { set } from 'lodash';
import { property } from './decorators/property';
import { ISchemaOptions } from './decorators/schema';

export interface IMetaData {
  attributes: IDictionary;
  relationships: IDictionary<IRelationship>;
}
export interface IRelationship {
  cardinality: string;
  policy: RelationshipPolicy;
}
export enum RelationshipPolicy {
  keys = 'keys',
  lazy = 'lazy',
  inline = 'inline'
}
export enum RelationshipCardinality {
  hasMany = 'hasMany',
  belongsTo = 'belongsTo'
}

export abstract class BaseSchema {
  /** The primary-key for the record */
  @property public id?: string;
  /** The last time that a given model was updated */
  @property public lastUpdated?: datetime;
  /** The datetime at which this record was first created */
  @property public createdAt?: datetime;
  /** Metadata properties of the given schema */
  public META?: Partial<ISchemaOptions>;
}
